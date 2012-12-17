(function(exports, $) {

  /**
   * Creates an instance of the client
   *
   * @param {String} host The remote host to connect to
   * @param {Number} port The port to connect to at the remote host
   * @param {Object} options
   */
  function RubyDebugClient(host, port, options) {
    this.host = host;
    this.port = port;
    this.tcpClient = new TcpClient(host, port);

    // default options is an empty object
    options = options || {};

    // current line
    this.line = null;

    // current file
    this.file = null;

    // response spool
    this.spool = "";

    // connection status
    this.connected = false;

    this.breakpoints = [];

    // prebind all the built-in callbacks
    this.monitorSocket = this.monitorSocket.bind(this);
    this.handleResponseData = this.handleResponseData.bind(this);
    this.verifyConnection = this.verifyConnection.bind(this);
    this.processWhere = this.processWhere.bind(this);
    this.processBreakpoints = this.processBreakpoints.bind(this);
    this.processList = this.processList.bind(this);
    this.processFiles = this.processFiles.bind(this);
    this.processThreads = this.processThreads.bind(this);
    this.noop = this.noop.bind(this);

    // set up callbacks for connection status changes
    this.onConnect = options.connect || this.noop;
    this.onDisconnect = options.disconnect || this.noop;

    /**
     * Responders is a stack of objects for handling responses
     */
    this.responders = [];

    /**
     * File contents cache
     */
    this.fileContentsCache = {};
  }

  /**
   * An empty callback to use when none is available.
   */
  RubyDebugClient.prototype.noop = function(){};

  /**
   * Interval for polling connection status (in ms)
   */
  RubyDebugClient.prototype.verifyConnectionInterval = 1000;

  /**
   * Connects to the remote debugger
   *
   * @param {Function} callback The function to call on connection
   * @return {RubyDebugClient} this
   */
  RubyDebugClient.prototype.connect = function(){
    // do nothing on the initial prompt
    this.responders.push({});

    // connect and begin monitoring the socket
    this.tcpClient.connect(this.monitorSocket);

    return this;
  };

  /**
   * Disconnects from the remote debugger
   */
  RubyDebugClient.prototype.disconnect = function(){
    this.tcpClient.disconnect();
  };

  /**
   * After connecting to the tcp socket, begin watching for responses and
   * polling for connection status changes.
   */
  RubyDebugClient.prototype.monitorSocket = function(){
    this.tcpClient.addResponseListener(this.handleResponseData);

    // create a poller to check the connection status
    this.checkConectionTimeout = window.setInterval(
      this.verifyConnection, 1000
    );
  };

  /**
   * Handle a raw stream of incoming data from the socket, parse it into
   * discrete chunks and dispatch the appropriate event handler for each one.
   *
   * @param {String} data inbound data to process
   */
  RubyDebugClient.prototype.handleResponseData = function(data){
    this.spool += data;

    var match = null;
    while ((match = this.spool.search(this.promptMatcher)) > -1) {
      // for every prompt found, send all the response data as an argument
      // to the next callback in the stack
      var responder = this.responders.shift();
      var dataSlice = this.spool.slice(0, match);

      if (typeof responder.processor === "function") {
        dataSlice = responder.processor(dataSlice);
      }

      if (typeof responder.callback === "function") {
        responder.callback(dataSlice);
      }

      // remove everything before the prompt
      this.spool = this.spool.slice(match);

      // remove the prompt itself (only this one)
      this.spool = this.spool.replace(this.promptMatcher, "");
    }
  };

  /**
   * Match a prompt in the resonse from ruby-debug. The prompt separates the
   * response from one command from another.
   */
  RubyDebugClient.prototype.promptMatcher = new RegExp("(?:^|\n)PROMPT .*\n");

  /**
   * Get the position in the stack
   *
   * @param {Function} callback function to receive stack position data
   */
  RubyDebugClient.prototype.where = function(callback) {
    this.dispatchInstruction("where", callback, this.processWhere);
  };

  /**
   * Process the response from a "where" command
   *
   * @return {Array} array of stack objects
   */
  RubyDebugClient.prototype.processWhere = function(responseLines) {
    var stack = [];
    var matcher = /(-->)? +#(?:\d+)\s*(.*)?\s+at line (.*):(\d+)/g;
    var rdc = this;

    responseLines.replace(matcher, function(match, cur, context, file, line) {
      // apparently there is no context sometimes, I guess that means it's
      // global...
      context = (context || "global").replace(/\n$/, "");

      var frame = {
        current: !!cur,
        context: context,
        filename: file,
        line: window.parseInt(line, 10)
      };

      stack.push(frame);

      if (frame.current) {
        rdc.file = frame.filename;
        rdc.line = frame.line;
      }
    });


    return stack;
  };

  /**
   * List the code being executed
   *
   * @param {Function} Callback will be called to handle the list response
   */
  RubyDebugClient.prototype.list = function(callback){
    this.dispatchInstruction("list 0-1000000", callback, this.processList);
  };

  /**
   * Process the response from a "list" command
   *
   * @return {Array} array of stack objects
   */
  RubyDebugClient.prototype.processList = function(responseLines) {
    if (typeof this.fileContentsCache[this.file] !== "undefined") {
      return this.fileContentsCache[this.file];
    }

    var lines = [];
    var matcher = /(?:\d+) {2}(.*)$/;

    $.each(responseLines.split("\n"), function(){
      var matches = this.match(matcher);

      if (matches) {
        lines.push(matches[1]);
      }
    });

    var content = lines.join("\n");

    this.fileContentsCache[this.file] = content;

    return content;
  };

  /**
   * Get the contents of an arbitrary file. ruby-debug doesn't have a mechanism
   * for listing the contents of an arbitrary file. This works around that
   * limitation by attempting to read from the filesystem. Of course this won't
   * work remotely unless the remote filesystem is mounted locally.
   *
   * @param {String} file name of a file to read
   * @param {Function} callback function to call with the file contents
   */
  RubyDebugClient.prototype.readFile = function(file, callback){
    var rdc = this;

    if (this.fileContentsCache[file]) {
      // cache hit
      callback(this.fileContentsCache[file]);
    } else {
      // cache miss

      // read the file and force inspect to use to_s so it doesn't pollute the
      // socket with fancy escape characters
      var instruction = "eval (s = IO.read(\"" + file + "\")\\; def s.inspect\\; self.to_s\\; end\\; s)";
      this.dispatchInstruction(instruction, function(response) {
        rdc.fileContentsCache[file] = response;
        callback(response);
      });
    }
  };

  /**
   * Ask the ruby debugger to insert a breakpoint at the specified file and
   * line number. If successful, execute the callback.
   *
   * @param {String} file name of the file for the breakpoint
   * @param {Number} lineNumber line number for the breakpoint
   * @param {Function} callback callback fired when the debugger successfully
   *   added the requested breakpoint
   */
  RubyDebugClient.prototype.requestBreakpoint = function(file, lineNumber, callback){
    var rdc = this;
    var successMatch = new RegExp("Breakpoint \\d+ file " + file + ", line " + lineNumber);
    var noStopPointMatch = new RegExp("\\*\\*\\* Line " + lineNumber + " is not a stopping point");

    this.dispatchInstruction("break " + file + ":" + lineNumber, function(response){
      if (response.match(successMatch)) {
        callback();

        // TODO: testme
        rdc.listBreakpoints(this.noop);

      } else if (response.match(noStopPointMatch)) {
        // cannot stop here, don't call back
      }
    });
  };

  /**
   * Clear the breakpoint specified by the given index. Calls the callback when
   * complete.
   *
   * @param {String} filename file name of the break point to remove
   * @param {Number} line line number of the break point to remove
   * @param {Function} callback function to call when complete
   */
  RubyDebugClient.prototype.clearBreakpoint = function(filename, line, callback){
    var breakpoint;

    $.each(this.breakpoints, function(){
      if (this.filename === filename && this.line === line) {
        breakpoint = this;
      }
    });

    if (breakpoint) {
      this.dispatchInstruction("delete " + breakpoint.index, callback);
    }
  };

  /**
   * Retreive a list of breakpoints and their states
   *
   * @param {Function} callback callback to receive the breakpoints
   */
  RubyDebugClient.prototype.listBreakpoints = function(callback){
    this.dispatchInstruction("info breakpoints", callback, this.processBreakpoints);
  };

  /**
   * Transform a breakpoint listing response into structured data: An array of
   * breakpoint objects.
   *
   * @param {String} response response from a call to 'info breakpoints'
   * @return {Array} array of breakpoint objects
   */
  RubyDebugClient.prototype.processBreakpoints = function(response){
    var responseLines = response.split("\n");
    var breakpoints = [];
    var bpMatch = new RegExp("^  (\\d+) ([yn])   at (.*):(\\d+)(?: if )?(.*)$");

    $.each(responseLines, function(){
      var matches = this.toString().match(bpMatch);

      if (matches) {
        breakpoints.push({
          index: window.parseInt(matches[1], 10),
          enabled: matches[2] === "y",
          filename: matches[3],
          line: window.parseInt(matches[4], 10),
          condition: matches[5] === "" ? null : matches[5]
        });
      }
    });

    this.breakpoints = breakpoints;

    return breakpoints;
  };

  /**
   * Issue a control flow instruction to the debugger
   *
   * @param {String} instruction
   */
  RubyDebugClient.prototype.controlFlow = function(instruction) {
    switch(instruction) {
      case "continue":
      case "step":
      case "next":
      case "up":
      case "down":
      this.dispatchInstruction(instruction, this.noop);
      break;
    }
  };

  /**
   * Dispatch an instruction to the remote debugger and specify the callback
   * method to handle the response. Monitor connection status by looking at the
   * number of bytes that were actually written with each message. This seems
   * to be the only reliable way to determine whether or not a connection is
   * truly established.
   *
   * @param {String} instruction name of the instruction
   * @param {Function} callback function to handle the response
   * @param {Function} processor optional function to process the data before
   *   calling the callback
   */
  RubyDebugClient.prototype.dispatchInstruction = function(instruction, callback, processor){
    this.responders.push({
      callback: callback,
      processor: processor
    });

    this.tcpClient.sendMessage(instruction);
  };

  /**
   * Verify the TCP connection by sending an empty message, basically like
   * pressing return in the debugger.
   */
  RubyDebugClient.prototype.verifyConnection = function(){
    var rdc = this;
    var lastConnectedState = rdc.connected;
    this.responders.push({});

    this.tcpClient.sendMessage("", function(writeInfo){
      if (writeInfo.bytesWritten > -1) {
        rdc.connected = true; // connected
      } else {
        rdc.connected = false; // not connected
      }

      // connection status has changed
      if (rdc.connected !== lastConnectedState) {
        if (rdc.connected) {
          rdc.onConnect();
        } else {
          window.clearInterval(rdc.checkConectionTimeout);
          rdc.onDisconnect();
        }
      }
    });
  };

  /**
   * Switch to the specified frame
   *
   * @param {Integer} frameId frame position (ie 0, 1, 2, etc.)
   */
  RubyDebugClient.prototype.frame = function(frameId) {
    this.dispatchInstruction("frame " + frameId, this.noop);
  };

  /**
   * Semicolon-matching regexp
   */
  RubyDebugClient.prototype.semicolonMatcher = /;/g;

  /**
   * Instruct the remote debugger to evaluate an arbitrary string and call back
   * with the response.
   *
   * @param {String} command string to evaluate
   * @param {Function} callback function to call with the response
   */
  RubyDebugClient.prototype.evaluate = function(command, callback){
    // escape semicolons because we're not entering multiple debugger commands
    // on one line and semicolon escaping is useful for evaluating ruby
    // one-liners
    this.dispatchInstruction(
      "eval " + command.replace(this.semicolonMatcher, "\\;"),
      callback
    );
  };

  /**
   * Get a list of all the files active in the interpreter
   * @param {Function} callback
   *
   */
  RubyDebugClient.prototype.files = function(callback) {
    this.dispatchInstruction("info files", callback, this.processFiles);
  };

  /**
   * RegExp for matching lines in the file listing
   */
  RubyDebugClient.prototype.fileMatcher = /^File (?:(.*) - )?(.*)$/;

  /**
   * Process the list of files
   *
   * @param {String} response response from the file listing
   * @return {Array} An array of filenames. Each item in the returned array is
   * an array of names for a single file.
   */
  RubyDebugClient.prototype.processFiles = function(response) {
    var rdc = this;
    var files = [];

    $.each(response.split("\n"), function(){
      var matches = this.match(rdc.fileMatcher);
      var names = [];
      if (matches) {
        if (matches[1]) {
          names.push(matches[1]);
        }
        names.push(matches[2]);
        files.push(names);
      }
    });

    return files;
  };

  /**
   * RegExp for matching a thread from the thread listing
   */
  RubyDebugClient.prototype.threadMatcher = /^([ \+\$])([ \!])(\d+) (#<.*>)\t?(?:(.*):)?(.*)?$/;

  /**
   * Get a list of all the files active in the interpreter
   * @param {Function} callback
   *
   */
  RubyDebugClient.prototype.threads = function(callback) {
    this.dispatchInstruction("info threads", callback, this.processThreads);
  };

  /**
   * Process the thread list
   *
   * @param {String} response response from the thread listing
   * @return {Array} An array of thread objects
   */
  RubyDebugClient.prototype.processThreads = function(response) {
    var threads = [];
    var responseLines = response.split("\n");
    var i;

    for (i = 0; i < responseLines.length; i++) {
      var matches = responseLines[i].match(this.threadMatcher);

      threads.push({
        id: window.parseInt(matches[3]),
        current: matches[1] === "+",
        ignored: matches[2] === "!",
        suspended: matches[1] === "$",
        text: matches[4],
        file: matches[5],
        line: matches[6] ? window.parseInt(matches[6], 10) : undefined
      });
    }

    return threads;
  };

  /**
   * Switch threads
   *
   * @param {Number} threadNumber
   */
  RubyDebugClient.prototype.switchThread = function(threadNumber) {
    this.dispatchInstruction("thread switch " + threadNumber);
  };

  /**
   * Export the interface
   */
  exports.RubyDebugClient = RubyDebugClient;

})(window, jQuery);
