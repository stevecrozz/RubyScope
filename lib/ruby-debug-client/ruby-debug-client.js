(function(exports, $) {

  /**
   * Creates an instance of the client
   *
   * @param {String} host The remote host to connect to
   * @param {Number} port The port to connect to at the remote host
   */
  function RubyDebugClient(host, port) {
    this.host = host;
    this.port = port;
    this.tcpClient = new TcpClient(host, port);

    // current line
    this.line = null;

    // current file
    this.file = null;

    // response spool
    this.spool = "";

    this.breakpoints = [];

    return this;
  }

  /**
   * Callback stack is called back for each response in the order they are
   * added.
   */
  RubyDebugClient.prototype.callbacks = [];

  /**
   * Connects to the remote debugger
   *
   * @param {Function} callback The function to call on connection
   */
  RubyDebugClient.prototype.connect = function(callback) {
    var debugClient = this;
    var tcpClient = this.tcpClient;

    // add the connection callback
    this.callbacks.push(callback);

    tcpClient.connect(function() {
      tcpClient.addResponseListener(function(data) {
        debugClient.spool += data;

        var match = null;
        while ((match = debugClient.spool.search(debugClient.promptMatcher)) > -1) {
          debugClient.callbacks.shift()(
            debugClient.spool.slice(0, match)
          );

          debugClient.spool = debugClient.spool.slice(match);
          debugClient.spool = debugClient.spool.replace(debugClient.promptMatcher, "");
        }

      });
    });

    return this;
  };

  RubyDebugClient.prototype.promptMatcher = new RegExp("(?:^|\n)PROMPT .*\n");

  /**
   * Get the position in the stack
   */
  RubyDebugClient.prototype.where = function(callback) {
    var rdc = this;

    this.dispatchInstruction("where", function(response){
      callback(rdc.processWhere(response));
    });
  };

  /**
   * Process the response from a "where" command
   *
   * @return {Array} array of stack objects
   */
  RubyDebugClient.prototype.processWhere = function(responseLines) {
    var stack = [];
    var matcher = /(-->)? +#(?:\d+)\s*(.*)?\s+at line (.*):(\d+)/g;
    var debugClient = this;

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
        debugClient.file = frame.filename;
        debugClient.line = frame.line;
      }
    });


    return stack;
  };

  /**
   * Callback where response
   */
  RubyDebugClient.prototype.onWhere = function(){};

  /**
   * List the code being executed
   */
  RubyDebugClient.prototype.list = function(callback){
    var rdc = this;

    if (this.fileContentsCache[this.file]) {
      // cache hit
      callback(this.fileContentsCache[this.file]);
    } else {
      // cache miss
      this.dispatchInstruction("list 0-1000000", function(response){
        callback(rdc.processList(response));
      });
    }
  };

  /**
   * Get the contents of an arbitrary file
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
    var rdc = this;

    this.dispatchInstruction("info breakpoints", function(response){
      callback(rdc.processBreakpoints(response));
    });
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
   * Process the response from a "list" command
   *
   * @return {Array} array of stack objects
   */
  RubyDebugClient.prototype.processList = function(responseLines) {
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
   * File contents cache
   */
  RubyDebugClient.prototype.fileContentsCache = {};

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
      this.dispatchInstruction(instruction, function(){});
      break;
    }
  };

  /**
   * Dispatch an instruction to the remote debugger and specify the callback
   * method to handle the response.
   *
   * @param {String} instruction name of the instruction
   * @param {Function} callback
   */
  RubyDebugClient.prototype.dispatchInstruction = function(instruction, callback){
    this.callbacks.push(callback);
    this.tcpClient.sendMessage(instruction);
  };

  /**
   * Switch to the specified frame
   *
   * @param {Integer} frameId frame position (ie 0, 1, 2, etc.)
   */
  RubyDebugClient.prototype.frame = function(frameId) {
    this.dispatchInstruction("frame " + frameId, function(){});
  };

  /**
   * Semicolon-matching regexp
   */
  RubyDebugClient.prototype.semicolonMatcher = /;/g;

  RubyDebugClient.prototype.evaluate = function(command, callback){
    // escape semicolons because we're not entering multiple debugger commands
    // on one line and semicolon escaping is useful for evaluating ruby
    // one-liners
    this.dispatchInstruction(
      "eval " + command.replace(this.semiColonMatcher, "\\;"),
      callback
    );
  };

  /**
   * Get a list of all the files active in the interpreter
   * @param {Function} callback
   *
   */
  RubyDebugClient.prototype.files = function(callback) {
    var rdc = this;

    this.dispatchInstruction("info files", function(response){
      callback(rdc.processFiles(response));
    });
  };

  /**
   * Process the list of files
   *
   * @param {String} response response from the file listing
   */
  RubyDebugClient.prototype.processFiles = function(response) {
    var fileMatch = /^File (.*)$/;
    var files = [];

    $.each(response.split("\n"), function(){
      var matches = this.match(fileMatch);
      if (matches) {
        files.push(matches[1]);
      }
    });

    return files;
  };

  RubyDebugClient.prototype.onFiles = function() {};

  /**
   * Export the interface
   */
  exports.RubyDebugClient = RubyDebugClient;

})(window, jQuery);
