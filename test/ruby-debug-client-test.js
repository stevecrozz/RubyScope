/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

  module("RubyDebugClient#new", {
    setup: function() {
      this.elems = $("#qunit-fixture").children();
    }
  });

  test("sets host and port", 2, function() {
    var rdc = new RubyDebugClient("somehost", "someport");
    strictEqual(rdc.host, "somehost", "host is set");
    strictEqual(rdc.port, "someport", "port is set");
  });

  test("sets connection status callbacks", 2, function(){
    var param1 = "param1";
    var param2 = "param2";

    var rdc = new RubyDebugClient(null, null, {
      connect: param1,
      disconnect: param2
    });

    strictEqual(rdc.onConnect, param1, "sets connection callback");
    strictEqual(rdc.onDisconnect, param2, "sets disconnection callback");
  });

  test("all other properties are initialized to their defaults", 7, function(){
    var rdc = new RubyDebugClient();
    strictEqual(rdc.line, null, "current line is unset");
    strictEqual(rdc.file, null, "current file is unset");
    strictEqual(rdc.spool, "", "response spool is empty");
    strictEqual(rdc.connected, false, "is not connected");
    deepEqual(rdc.breakpoints, [], "there are no breakpoints");
    strictEqual(rdc.onConnect, rdc.noop, "there is no connection callback");
    strictEqual(rdc.onDisconnect, rdc.noop, "there is no disconnection callback");
  });

  module("RubyDebugClient#connect", {});

  test("establishes a connection to the tcp socket", 3, function() {
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.tcpClient.connect = spy;
    rdc.connect();

    strictEqual(spy.called, true, "calls TcpSocket#connect");
    strictEqual(spy.calledWith(rdc.monitorSocket), true, "installs the connect callback");
    deepEqual(rdc.responders, [{}], "adds an empty responder object");
  });

  module("RubyDebugClient#disconnect", {});

  test("disconnects from the tcp client", 1, function(){
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.tcpClient.disconnect = spy;
    rdc.disconnect();

    strictEqual(spy.called, true, "calls TcpSocket#disconnect");
  });

  module("RubyDebugClient#monitorSocket", {});

  test("monitors the socket for data", 4, function(){
    var rdc = new RubyDebugClient();
    var spy1 = sinon.spy();
    rdc.tcpClient.addResponseListener = spy1;
    rdc.tcpClient.sendMessage = function(){};

    var spy2 = sinon.spy();
    rdc.verifyConnection = spy2;

    var clock = sinon.useFakeTimers();
    rdc.monitorSocket();

    strictEqual(spy1.called, true, "calls TcpSocket#addResponseListener");
    strictEqual(spy1.calledWith(rdc.handleResponseData), true, "installs the response callback");

    strictEqual(spy2.called, false, "doesn't call verifyConnection immediately");
    clock.tick(rdc.verifyConnectionInterval * 2);
    strictEqual(spy2.calledTwice, true, "calls verifyConnection every connection interval");

    clock.restore();
  });

  module("RubyDebugClient#handleResponseData", {});

  test("hits the first callback when it finds a prompt", 3, function(){
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.responders = [{ callback: spy }, 2, 3];

    rdc.handleResponseData("sometest\ndata\nPROMPT (rdb:1) \n");
    strictEqual(spy.called, true, "calls the first callback");
    strictEqual(spy.args[0][0], "sometest\ndata");
    strictEqual(rdc.spool, "", "no data remains in the spool");
  });

  test("hits multiple responders, once for each prompt", 5, function(){
    var rdc = new RubyDebugClient();
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    rdc.responders = [{ callback: spy1 }, { callback: spy2 }, 3];

    rdc.handleResponseData(
      "sometest\ndata\nPROMPT (rdb:1) \nsecondtest\nPROMPT (rdb:1) \n"
    );

    strictEqual(spy1.called, true, "calls the first callback");
    strictEqual(spy1.args[0][0], "sometest\ndata");
    strictEqual(spy2.called, true, "calls the second callback");
    strictEqual(spy2.args[0][0], "secondtest");
    strictEqual(rdc.spool, "", "no data remains in the spool");
  });

  test("doesn't call back until the prompt arrives", 4, function(){
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.responders = [{ callback: spy }];
    rdc.handleResponseData("testing one t");

    strictEqual(spy.called, false, "doesn't call back because the prompt hasn't arrived");

    rdc.handleResponseData("wo three\nPROMPT (rdb:1) \n");
    strictEqual(spy.called, true, "calls back now that the prompt has arrived");
    strictEqual(spy.args[0][0], "testing one two three", "callback receives the right argument");
    strictEqual(rdc.spool, "", "no data remains in the spool");
  });

  module("RubyDebugClient#where");

  test("sends where instruction with callback and processor", 4, function(){
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.dispatchInstruction = spy;
    var callback = sinon.spy();

    rdc.where(callback);

    strictEqual(spy.called, true, "calls dispatchInstruction");
    strictEqual(spy.args[0][0], "where", "sends the instruction");
    strictEqual(spy.args[0][1], callback, "passes the callback");
    strictEqual(spy.args[0][2], rdc.processWhere, "passes the processor");
  });

  module("RubyDebugClient#processWhere", {
    setup: function() {
      this.responseA = RubyDebugClient.prototype.processWhere(
        "    #0 B.some_method at line debugger.rb:20\n" +
        "--> #1 A.hi at line debugger.rb:28\n" +
        "    #2 at line debugger.rb:39\n" +
        "Warning: saved frames may be incomplete;\n" +
        "compare debugger backtrace (bt) with Ruby caller(0).\n"
      );
    }
  });

  test("current frame is marked current", 3, function() {
    strictEqual(this.responseA[0].current, false, "frame 0 is not current");
    strictEqual(this.responseA[1].current, true, "frame 1 is current");
    strictEqual(this.responseA[2].current, false, "frame 2 is not current");
  });

  test("frames capture context", 3, function() {
    strictEqual(this.responseA[0].context, "B.some_method", "frame 0 context");
    strictEqual(this.responseA[1].context, "A.hi", "frame 1 context");
    strictEqual(this.responseA[2].context, "global", "frame 2 context");
  });

  test("frames have file names", 3, function() {
    strictEqual(this.responseA[0].filename, "debugger.rb", "frame 0 filename");
    strictEqual(this.responseA[1].filename, "debugger.rb", "frame 1 filename");
    strictEqual(this.responseA[2].filename, "debugger.rb", "frame 2 filename");
  });

  test("frames have line numbers", 3, function() {
    strictEqual(this.responseA[0].line, 20, "frame 0 line");
    strictEqual(this.responseA[1].line, 28, "frame 1 line");
    strictEqual(this.responseA[2].line, 39, "frame 2 line");
  });

  module("RubyDebugClient#list");

  test("sends list instruction with callback and processor", 4, function(){
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.dispatchInstruction = spy;
    var callback = sinon.spy();

    rdc.list(callback);

    strictEqual(spy.called, true, "calls dispatchInstruction");
    strictEqual(spy.args[0][0], "list 0-1000000", "sends the instruction");
    strictEqual(spy.args[0][1], callback, "passes the callback");
    strictEqual(spy.args[0][2], rdc.processList, "passes the processor");
  });

  module("RubyDebugClient#processList", {
    setup: function() {
      this.listResponseA = $("#listResponseA").text();
      this.listResponseProcessedA = $("#listResponseProcessedA").text();
    }
  });

  test("strips line numbers and other useless information", 1, function() {
    var rdc = new RubyDebugClient();
    var processedList = rdc.processList(
      this.listResponseA
    );

    strictEqual(processedList, this.listResponseProcessedA, "list is processed");
  });

  module("RubyDebugClient#readFile");

  test("issues the expression to read an arbitrary file", 5, function(){
    var rdc = new RubyDebugClient();
    var messageReceived;
    var bogusFileContents = "FILE CONTENTS W00T!";
    rdc.dispatchInstruction = function(msg, callback){
      messageReceived = msg;
      callback(bogusFileContents);
    };
    var spy = sinon.spy();
    var expectedMessage = "eval (s = IO.read(\"x/y/z.rb\")\\; def s.inspect\\; self.to_s\\; end\\; s)";

    rdc.readFile("x/y/z.rb", spy);

    strictEqual(messageReceived, expectedMessage, "sends the instruction to read a file");
    strictEqual(spy.called, true, "callback is called");
    strictEqual(spy.args[0][0], bogusFileContents, "callback is called");

    // new spy, and ask for the same file
    spy = sinon.spy();
    messageReceived = undefined;
    rdc.readFile("x/y/z.rb", spy);

    // file should have been cached
    strictEqual(spy.called, true, "callback is called");
    strictEqual(messageReceived, undefined, "no instruction was dispatched (file was cached)");
  });

  module("RubyDebugClient#requestBreakpoint", {
    setup: function(){
      var testInstance = this;

      this.rdc = new RubyDebugClient();
      this.rdc.dispatchInstruction = function(msg, callback){
        testInstance.messageReceived = msg;
        callback(testInstance.response);
      };
      this.spy = sinon.spy();
    }
  });

  test("requests a breakpoint at a proper location", 2, function(){
    this.response = "Breakpoint 4 file /some/file.rb, line 5";
    this.rdc.requestBreakpoint("/some/file.rb", 5, this.spy);

    strictEqual(this.messageReceived, "break /some/file.rb:5", "correct instruction was sent");
    strictEqual(this.spy.called, true, "callback is called");
  });

  test("requests a breakpoint at an invalid stopping point", 2, function(){
    this.response = "*** Line 4 is not a stopping point in file \"/home/stevecrozz/Private/Projects/rubyscope/example/app.rb\".";
    this.rdc.requestBreakpoint("/some/file.rb", 4, this.spy);

    strictEqual(this.messageReceived, "break /some/file.rb:4", "correct instruction was sent");
    strictEqual(this.spy.called, false, "callback is not called");
  });

  test("requests a breakpoint outside the file boundary", 2, function(){
    this.response = "*** There are only 30 lines in file \"/some/file.rb\".";
    this.rdc.requestBreakpoint("/some/file.rb", 99, this.spy);

    strictEqual(this.messageReceived, "break /some/file.rb:99", "correct instruction was sent");
    strictEqual(this.spy.called, false, "callback is not called");
  });

  module("RubyDebugClient#clearBreakpoint", {});

  test("deletes break points by file and line number", 1, function() {
    var rdc = new RubyDebugClient();
    var receivedInstruction;

    rdc.breakpoints = [{
      filename: "somefile/name",
      line: 999,
      index: 40
    }];

    rdc.dispatchInstruction = function(instruction){
      receivedInstruction = instruction;
    };

    rdc.clearBreakpoint("somefile/name", 999, function(){});
    strictEqual(receivedInstruction, "delete 40", "deletes breakpoint 40");
  });

  module("RubyDebugClient#listBreakpoints", {});

  test("issues an info breakpoints command", 1, function() {
    var rdc = new RubyDebugClient();
    var receivedInstruction;
    rdc.dispatchInstruction = function(instruction){
      receivedInstruction = instruction;
    };
    rdc.listBreakpoints();
    strictEqual(receivedInstruction, "info breakpoints", "issues instruction");
  });

  test("issues an info breakpoints command", 1, function() {
    var rdc = new RubyDebugClient();
    var receivedInstruction;
    rdc.dispatchInstruction = function(instruction){
      receivedInstruction = instruction;
    };
    rdc.listBreakpoints();
    strictEqual(receivedInstruction, "info breakpoints", "issues instruction");
  });

  module("RubyDebugClient#processBreakpoints", {});

  test("handles a response with no breakpoints", 1, function() {
    var response = $("#breakpointsResponseA").text();

    deepEqual(
      RubyDebugClient.prototype.processBreakpoints(response),
      [],
      "no breakpoints are set"
    );
  });

  test("handles a response with 1 breakpoint", 2, function() {
    var rdc = new RubyDebugClient();
    var response = $("#breakpointsResponseB").text();

    deepEqual(
      rdc.processBreakpoints(response),
      [{
        index: 1,
        enabled: true,
        filename: "/home/stevecrozz/Projects/some_project/config/initializers/object_extensions.rb",
        condition: null,
        line: 7
      }],
      "one breakpoint is set"
    );

    deepEqual(
      rdc.processBreakpoints(response),
      rdc.breakpoints,
      "breakpoints are saved in the breakpoints property"
    );

  });

  test("handles a response with 2 breakpoints, with one disabled", 1, function() {
    var response = $("#breakpointsResponseC").text();

    deepEqual(
      RubyDebugClient.prototype.processBreakpoints(response),
      [{
        index: 1,
        enabled: true,
        filename: "/home/stevecrozz/Projects/some_project/vendor/plugins/tr8n/lib/tr8n/token.rb",
        condition: null,
        line: 24
      }, {
        index: 2,
        enabled: false,
        filename: "/home/stevecrozz/.bundle/some_project/ruby/1.8/gems/actionmailer-2.3.5/lib/action_mailer/adv_attr_accessor.rb",
        condition: null,
        line: 10
      }],
      "two breakpoints set"
    );

  });

  module("RubyDebugClient#controlFlow", {});

  test("sends control messages to the remote debugger", 6, function(){
    var rdc = new RubyDebugClient();

    rdc.dispatchInstruction = sinon.spy();
    rdc.controlFlow("continue");
    strictEqual(rdc.dispatchInstruction.calledWith("continue", rdc.noop), true, "sends continue");

    rdc.dispatchInstruction = sinon.spy();
    rdc.controlFlow("step");
    strictEqual(rdc.dispatchInstruction.calledWith("step", rdc.noop), true, "sends step");

    rdc.dispatchInstruction = sinon.spy();
    rdc.controlFlow("next");
    strictEqual(rdc.dispatchInstruction.calledWith("next", rdc.noop), true, "sends next");

    rdc.dispatchInstruction = sinon.spy();
    rdc.controlFlow("up");
    strictEqual(rdc.dispatchInstruction.calledWith("up", rdc.noop), true, "sends up");

    rdc.dispatchInstruction = sinon.spy();
    rdc.controlFlow("down");
    strictEqual(rdc.dispatchInstruction.calledWith("down", rdc.noop), true, "sends down");

    rdc.dispatchInstruction = sinon.spy();
    rdc.controlFlow("foobar");
    strictEqual(rdc.dispatchInstruction.calledWith("foobar", rdc.noop), false, "doesn't send invalid commands");
  });

  module("RubyDebugClient#dispatchInstruction", {});

  test("dispatches instructions to the underlying socket", 2, function(){
    var rdc = new RubyDebugClient();
    rdc.tcpClient.sendMessage = sinon.spy();

    rdc.dispatchInstruction("Instruction1", "boguscallback1");
    strictEqual(rdc.tcpClient.sendMessage.calledWith("Instruction1"), true, "dispatches an instruction");
    deepEqual(rdc.responders, [{
      callback: "boguscallback1", processor: undefined
    }], "adds a responder");
  });

  test("adds a processor to the responder if provided", 2, function(){
    var rdc = new RubyDebugClient();
    rdc.tcpClient.sendMessage = sinon.spy();

    rdc.dispatchInstruction("Instruction2", "boguscallback2", "bogusprocessor2");
    strictEqual(rdc.tcpClient.sendMessage.calledWith("Instruction2"), true, "dispatches an instruction");
    deepEqual(rdc.responders, [{
      callback: "boguscallback2", processor: "bogusprocessor2"}
    ], "adds a processor");
  });

  module("RubyDebugClient#verifyConnection", {
    setup: function(){
      this.rdc = new RubyDebugClient();
      this.successfulSender = function(instruction, callback){
        callback({ bytesWritten: 2 });
      };
      this.failedSender = function(instruction, callback) {
        callback({ bytesWritten: -15 });
      };
    }
  });

  test("sends an empty message to the underlying socket", 1, function(){
    var spy = sinon.spy();
    this.rdc.tcpClient.sendMessage = spy;
    this.rdc.verifyConnection();

    strictEqual(spy.calledWith(""), true, "sends an empty message");
  });

  test("calls the onConnect callback once connected", 6, function(){
    var spy = sinon.spy();
    this.rdc.onConnect = spy;
    this.rdc.tcpClient.sendMessage = this.failedSender;
    strictEqual(this.rdc.connected, false, "is not connected initially");
    strictEqual(spy.called, false, "onConnect is not called");

    this.rdc.verifyConnection();
    strictEqual(this.rdc.connected, false, "is not connected when sending message fails");
    strictEqual(spy.called, false, "onConnect is not called");

    this.rdc.tcpClient.sendMessage = this.successfulSender;
    this.rdc.verifyConnection();
    strictEqual(this.rdc.connected, true, "becomes connected when sending message succeeds");
    strictEqual(spy.called, true, "onConnect is called");
  });

  test("calls the onDisconnect callback once disconnected", 4, function(){
    var spy = sinon.spy();
    this.rdc.onDisconnect = spy;
    this.rdc.tcpClient.sendMessage = this.successfulSender;
    this.rdc.connected = true;

    this.rdc.verifyConnection();
    strictEqual(this.rdc.connected, true, "is connected when sending message succeeds");
    strictEqual(spy.called, false, "onDisconnect is not called");

    this.rdc.tcpClient.sendMessage = this.failedSender;
    this.rdc.verifyConnection();
    strictEqual(this.rdc.connected, false, "becomes disconnected when sending message fails");
    strictEqual(spy.called, true, "onDisconnect is called");
  });

  module("RubyDebugClient#frame");

  test("switches to the specified frame", 1, function(){
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.dispatchInstruction = spy;
    rdc.frame(3);

    strictEqual(spy.calledWith("frame 3", rdc.noop), true, "sends the right instruction and callback");
  });

  module("RubyDebugClient#evaluate");

  test("instructs the remote debugger to evaluate a string", 1, function(){
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.dispatchInstruction = spy;

    rdc.evaluate("abc", "somecallback");
    strictEqual(spy.calledWith("eval abc", "somecallback"), true, "sends the right instruction and callback");
  });

  test("escapes semicolons for evaluation", 1, function(){
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.dispatchInstruction = spy;

    rdc.evaluate("one; two; three;;", "somecallback");
    strictEqual(spy.args[0][0], "eval one\\; two\\; three\\;\\;", true, "escapes semicolons");
  });

  module("RubyDebugClient#files");

  test("sends file listing instruction with callback and processor", 4, function(){
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.dispatchInstruction = spy;
    var callback = sinon.spy();

    rdc.files(callback);

    strictEqual(spy.called, true, "calls dispatchInstruction");
    strictEqual(spy.args[0][0], "info files", "sends the instruction");
    strictEqual(spy.args[0][1], callback, "passes the callback");
    strictEqual(spy.args[0][2], rdc.processFiles, "passes the processor");
  });

  module("RubyDebugClient#processFiles", {});

  test("processes file listing", 1, function(){
    var filesResponse = $("#filesResponseA").text();
    var processedFiles = RubyDebugClient.prototype.processFiles(filesResponse);
    var expectedFiles = [
      ["/home/stevecrozz/.rbenv/versions/ree-1.8.7-2011.03/lib/ruby/1.8/e2mmap.rb"],
      ["app.rb", "/home/stevecrozz/Private/Projects/rubyscope/example/app.rb"]
    ];
    deepEqual(processedFiles, expectedFiles, "files match");
  });

  module("RubyDebugClient#threads");

  test("sends thread listing instruction with callback and processor", 4, function(){
    var rdc = new RubyDebugClient();
    var spy = sinon.spy();
    rdc.dispatchInstruction = spy;
    var callback = sinon.spy();

    rdc.threads(callback);

    strictEqual(spy.called, true, "calls dispatchInstruction");
    strictEqual(spy.args[0][0], "info threads", "sends the instruction");
    strictEqual(spy.args[0][1], callback, "passes the callback");
    strictEqual(spy.args[0][2], rdc.processThreads, "passes the processor");
  });

  module("RubyDebugClient#processThreads");

  test("processes thread listing", 1, function(){
    var threadResponse = $("#threadResponseA").text();
    var processedThreads = RubyDebugClient.prototype.processThreads(threadResponse);
    var expectedThreads = [
      { current: true, suspended: false, ignored: false, text: "#<Thread:0x474f1e0 run>", file: "app.rb", line: 24 },
      { current: false, suspended: false, ignored: true, text: "#<Debugger::DebugThread:0x301d5d0 sleep>", file: undefined, line: undefined },
      { current: false, suspended: false, ignored: true, text: "#<Debugger::DebugThread:0x301d3c8 sleep>", file: undefined, line: undefined },
      { current: false, suspended: true, ignored: false, text: "#<Thread:0x301d238 sleep>", file: "app.rb", line: 9 }
    ];
    deepEqual(processedThreads, expectedThreads, "threads are processed");
  });

}(jQuery));
