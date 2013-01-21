/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global DebuggerUi:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($, CodeView) {

  module("CodeViewTest#new", {});

  test("creates a new CodeView instance", function(){
    var dui = sinon.spy();
    var container = $("<div>");
    var view = new CodeView(dui, container);

    strictEqual(view.editor, undefined, "editor is initially undefined");
    strictEqual(view.lastLine, undefined, "lastLine is initially undefined");
  });

  module("BreakpointViewTest#render", {});

  test("calls new CodeMirror with correct params", function(){
    var dui = { registerView: sinon.spy() };
    var container = $("<div>");
    var view = new CodeView(dui, container, "whitespace");
    view.setActiveLine = function(){};
    view.getGutterClickHandler = sinon.stub();
    view.getGutterClickHandler.withArgs(undefined).returns("somehandler");
    view.render("somecontent");

    strictEqual(CodeMirror.called, true, "calls CodeMirror constructor");
    deepEqual([ container.get(0), {
      value: "somecontent",
      mode: "whitespace",
      lineNumbers: true,
      onGutterClick: "somehandler",
      readOnly: "nocursor"
    }], CodeMirror.args[0], "CodeMirror is given the right params");
  });

})(jQuery, DebuggerUi.View.CodeView);

