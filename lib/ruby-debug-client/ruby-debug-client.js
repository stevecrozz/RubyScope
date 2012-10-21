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

    return this;
  }

  /**
   * Callback stack is called back for each response in the order they are
   * added. Initially there's one empty callback to handle the initial
   * connection prompt.
   */
  RubyDebugClient.prototype.callbacks = [
    function(){}
  ];

  /**
   * Connects to the remote debugger
   *
   * @param {Function} callback The function to call on connection
   */
  RubyDebugClient.prototype.connect = function(callback) {
    var debugClient = this;
    var tcpClient = this.tcpClient;

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

      callback();
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
    var matcher = /(-->)? +#(?:\d+)\s*(.*\n)?\s*at line (.*):(\d+)/g;
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
   *
   */
  RubyDebugClient.prototype.files = function() {
    this.cmdStack.push("files");
    this.tcpClient.sendMessage("info files");
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
