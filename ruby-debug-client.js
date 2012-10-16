(function(exports) {

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
   * Debugger command stack
   */
  RubyDebugClient.prototype.cmdStack = [];

  /**
   * Connects to the remote debugger
   *
   * @param {Function} callback The function to call on connection
   */
  RubyDebugClient.prototype.connect = function(callback) {
    var debugClient = this;
    var tcpClient = this.tcpClient;

    debugClient.cmdStack.push("connect");

    tcpClient.connect(function() {
      tcpClient.addResponseListener(function(data) {
        debugClient.spool += data;

        var match = null;
        while ((match = debugClient.spool.search(debugClient.promptMatcher)) > -1) {
          debugClient.handleResponse(
            debugClient.cmdStack.shift(),
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

  RubyDebugClient.prototype.handleResponse = function(command, response) {
    switch(command) {
      case "where":
        this.onWhere(this.processWhere(response));
        break;

      case "list":
        this.onList(this.processList(response.split("\n")));
        break;

      case "eval":
        this.onEval(response);
        break;
    }
  }

  /**
   * Get the position in the stack
   */
  RubyDebugClient.prototype.where = function() {
    this.cmdStack.push("where");
    this.tcpClient.sendMessage("where");
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
  RubyDebugClient.prototype.list = function(){
    if (this.fileContentsCache[this.file]) {
      // cache hit
      this.onList(this.fileContentsCache[this.file]);
      console.log("file cache hit");
    } else {
      // cache miss
      console.log("file cache miss");
      this.cmdStack.push("list");
      this.tcpClient.sendMessage("list 0-1000000");
    }
  }

  /**
   * Process the response from a "list" command
   *
   * @return {Array} array of stack objects
   */
  RubyDebugClient.prototype.processList = function(responseLines) {
    var lines = [];
    var matcher = /(?:\d+)  (.*)$/;

    $.each(responseLines, function(){
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
   */
  RubyDebugClient.prototype.controlFlow = function(instruction) {
    switch(instruction) {
      case "continue":
      case "step":
      case "next":
      this.cmdStack.push(instruction);
      this.tcpClient.sendMessage(instruction);
      break;
    }
  }

  /**
   * Handle the list callback
   */
  RubyDebugClient.prototype.onList = function(){};


  /**
   * Semicolon-matching regexp
   */
  RubyDebugClient.prototype.semicolonMatcher = /;/g;

  RubyDebugClient.prototype.eval = function(command){
    this.cmdStack.push("eval");

    // escape semicolons because we're not entering multiple debugger commands
    // on one line and semicolon escaping is useful for evaluating ruby
    // one-liners
    this.tcpClient.sendMessage("eval " + command.replace(
      this.semicolonMatcher, "\\;")
    );
  };

  RubyDebugClient.prototype.onEval = function(){};

  /**
   * Export the interface
   */
  exports.RubyDebugClient = RubyDebugClient;

})(window);
