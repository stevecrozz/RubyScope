/*global jQuery:false */
/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global RubyScope:false */
/*global sinon:false */
(function($) {

  module("Layout#initialize");

  test("creates the sections", 4, function() {
    var parent = $("<div>");
    var onSpy = sinon.spy();
    var triggerSpy = sinon.spy();
    RubyScope.Layout.prototype.$window = {
      on: onSpy,
      trigger: triggerSpy
    };

    var layout = new RubyScope.Layout(parent);
    equal($("#emptyLayout").html(), parent.html(), "layout looks good");

    equal("resize", onSpy.args[0][0], "bind to resize");
    equal(layout.resize, onSpy.args[0][1], "bind the resizer");
    equal("resize", triggerSpy.args[0][0], "trigger an immediate resize");

    RubyScope.Layout.prototype.$window = $(window);
  });

  module("Layout#resize");

  test("resizes the layout", 1, function(){
    var layout = new RubyScope.Layout($("<div>"));
    layout.resize();

    equal(layout.contentPane.css("height"), $(window).height() + "px", "content takes up the whole window");
  });

  module("Layout#clear");

  test("clears the layout", 1, function(){
    var layout = new RubyScope.Layout($("<div>"));
    layout.panes = {
      empty: sinon.spy()
    };
    layout.clear();

    equal(layout.panes.empty.called, true, "empties the panes");
  });

}(jQuery));
