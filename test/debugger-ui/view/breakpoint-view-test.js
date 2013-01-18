/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global DebuggerUi:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($, BreakpointView) {

  module("BreakpointViewTest#new", {});

  test("instantiates a DebuggerUi given an empty adapter", 3, function(){
    var dui = { registerView: sinon.spy() };
    var container = $("<div>");
    var view = new BreakpointView(dui, container);
  });

})(jQuery, DebuggerUi.View.BreakpointView);

