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

  module("RubyDebugClient#processList", {
    setup: function() {
      this.listResponseA = $("#listResponseA").text();
      this.listResponseProcessedA = $("#listResponseProcessedA").text();
    }
  });

  test("strips line numbers and other useless information", 1, function() {
    var processedList = RubyDebugClient.prototype.processList(
      this.listResponseA
    );

    strictEqual(processedList, this.listResponseProcessedA, "list is processed");
  });

}(jQuery));
