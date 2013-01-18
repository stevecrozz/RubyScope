/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global DebuggerUi:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($, BreakpointView) {

  module("BreakpointViewTest#new", {});

  test("works with an empty list of breakpoints", 1, function(){
    var dui = { registerView: sinon.spy() };
    var container = $("<div>");
    var view = new BreakpointView(dui, container);
    view.render([]);

    var expected = $("#breakpoint-list-1").htmlClean().html();
    var result = container.htmlClean().html();
    strictEqual(expected, result, "generates an empty list");
  });

  test("works with a breakpoint", 1, function(){
    var dui = { registerView: sinon.spy() };
    var container = $("<div>");
    var view = new BreakpointView(dui, container);
    view.render([
      {
        index: 1,
        enabled: true,
        filename: "/home/stevecrozz/Projects/some_project/config/initializers/object_extensions.rb",
        condition: null,
        line: 7
      }
    ]);

    var expected = $("#breakpoint-list-2").htmlClean().html();
    var result = $(container).htmlClean().html();
    strictEqual(expected, result, "generates a non-empty list");
  });

})(jQuery, DebuggerUi.View.BreakpointView);

