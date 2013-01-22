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

  module("BreakpointViewTest#getEditor", {});

  test("calls new CodeMirror with correct params", function(){
    var dui = { registerView: sinon.spy() };
    var container = $("<div>");
    var view = new CodeView(dui, container, "whitespace");

    view.getGutterClickHandler = sinon.stub();
    view.getGutterClickHandler.withArgs("somefile").returns("somehandler");
    view.getEditor(container.get(0), "somecontent", "somefile");

    strictEqual(CodeMirror.called, true, "calls CodeMirror constructor");
    deepEqual([ container.get(0), {
      value: "somecontent",
      mode: "whitespace",
      lineNumbers: true,
      onGutterClick: "somehandler",
      readOnly: "nocursor"
    }], CodeMirror.args[0], "CodeMirror is given the right params");

    CodeMirror.reset();
  });

  module("BreakpointViewTest#render", {});

  test("calls getEditor with correct params", function(){
    var dui = { registerView: sinon.spy() };
    var container = $("<div>");
    var view = new CodeView(dui, container, "whitespace");
    view.setActiveLine = function(){};
    view.getEditor = sinon.spy();

    view.render("somecontent", undefined, "somefile", 99);

    var getEditorArgs = view.getEditor.args[0];
    strictEqual(container.get(0), getEditorArgs[0]);
    strictEqual("somecontent", getEditorArgs[1]);
    strictEqual("somefile", getEditorArgs[2]);
  });

  test("sets breakpoint markers", function(){
    var dui = { registerView: sinon.spy() };
    var container = $("<div>");
    var view = new CodeView(dui, container, "whitespace");
    view.setActiveLine = function(){};
    view.getEditor = sinon.stub();
    var editor = {
      setMarker: sinon.spy()
    };
    view.getEditor.returns(editor);

    var breakpoints = [{
      index: 1,
      enabled: true,
      filename: "some_file.whatever",
      condition: null,
      line: 7
    }, {
      index: 2,
      enabled: true,
      filename: "some_file.whatever",
      condition: null,
      line: 20
    }];

    view.render("ccontents", breakpoints, "some_file.whatever", 99);

    strictEqual(6, editor.setMarker.args[0][0], "line with index 6 is marked");
    strictEqual(view.breakpointMarker, editor.setMarker.args[0][1], "used the right marker");
    strictEqual(19, editor.setMarker.args[1][0], "line with index 20 is marked");
    strictEqual(view.breakpointMarker, editor.setMarker.args[1][1], "used the right marker");
  });

  test("calls #setActiveLine on the active line", function(){
    var dui = { registerView: sinon.spy() };
    var container = $("<div>");
    var view = new CodeView(dui, container, "whitespace");
    view.setActiveLine = sinon.spy();
    view.getEditor = sinon.stub();

    view.render("ccontents", [], "some_file.whatever", 99);

    strictEqual(view.setActiveLine.args[0][0], 99, "marks line 99 as active");
  });

  module("BreakpointViewTest#getGutterClickHandler", {});

  test("adds a new breakpoint", function(){
    var dui = {};
    dui.registerView = sinon.spy();
    dui.requestHandlers = {};
    dui.requestHandlers.requestBreakpoint = sinon.spy();

    var evtfile;
    var evtline;
    $(dui).bind("breakpointAdd.dui", function(event, file, line){
      evtfile = file;
      evtline = line;
    });

    var view = new CodeView(dui);
    var handler = view.getGutterClickHandler("someopenfile");
    var cm = {
      setMarker: sinon.spy(),
      lineInfo: sinon.stub()
    };

    cm.lineInfo.returns({});

    handler(cm, 55);
    var requestBreakpointArgs = dui.requestHandlers.requestBreakpoint.args[0];

    strictEqual(requestBreakpointArgs[0], "someopenfile", "operates on the right file");
    strictEqual(56, requestBreakpointArgs[1], "operates on the right line");

    var callback = requestBreakpointArgs[2];
    strictEqual(typeof callback, "function", "callback is a function");
    callback();

    strictEqual(evtfile, "someopenfile", "event is triggered with the filename");
    strictEqual(evtline, 56, "event is triggered with the line number");

    strictEqual(cm.setMarker.called, true, "CodeMirror#clear marker is called");
    strictEqual(cm.setMarker.args[0].length, 2, "CodeMirror#clear marker is given only two arguments");
    strictEqual(cm.setMarker.args[0][0], 55, "CodeMirror#clear marker is given the line number");
    strictEqual(cm.setMarker.args[0][1], view.breakpointMarker, "CodeMirror#clear marker is given the breakpoint marker");
  });

  test("removes a breakpoint that is already set", function(){
    var dui = {};
    dui.registerView = sinon.spy();
    dui.requestHandlers = {};
    dui.requestHandlers.clearBreakpoint = sinon.spy();

    var evtfile;
    var evtline;
    $(dui).bind("breakpointRemove.dui", function(event, file, line){
      evtfile = file;
      evtline = line;
    });

    var container = $("<div>");
    var view = new CodeView(dui, container, "whitespace");
    var handler = view.getGutterClickHandler("someopenfile");
    var cm = {
      clearMarker: sinon.spy(),
      lineInfo: sinon.stub()
    };

    // having markerText (the red dot) is how CodeView decides whether to add
    // or remove a breakpoint
    cm.lineInfo.returns({markerText: "sometext"});

    handler(cm, 55);
    var clearBreakpointArgs = dui.requestHandlers.clearBreakpoint.args[0];

    strictEqual(clearBreakpointArgs[0], "someopenfile", "operates on the right file");
    strictEqual(56, clearBreakpointArgs[1], "operates on the right line");

    var callback = clearBreakpointArgs[2];
    strictEqual(typeof callback, "function", "callback is a function");
    callback();

    strictEqual(evtfile, "someopenfile", "event is triggered with the filename");
    strictEqual(evtline, 56, "event is triggered with the line number");

    strictEqual(cm.clearMarker.called, true, "CodeMirror#clear marker is called");
    strictEqual(cm.clearMarker.args[0].length, 1, "CodeMirror#clear marker is given only one argument");
    strictEqual(cm.clearMarker.args[0][0], 55, "CodeMirror#clear marker is given the line number");
  });

  module("BreakpointViewTest#setActiveLine", {});

  test("sets a line as active", function(){
    var dui = {};
    dui.registerView = sinon.spy();
    var view = new CodeView(dui);
    view.editor = {
      setLineClass: sinon.spy(),
      getScrollerElement: sinon.spy(),
      scrollTo: sinon.spy()
    };

    view.setActiveLine(80);
    view.setActiveLine(90);

    var callargs = view.editor.setLineClass.args;

    deepEqual(callargs[0], [79, null, "current-line"], "passes line number to #setLineClass");
    deepEqual(callargs[1], [78, null, null], "passes line number to #setLineClass");
    deepEqual(callargs[2], [89, null, "current-line"], "passes line number to #setLineClass");
    strictEqual(view.editor.scrollTo.called, true, "calls scrollTo");
  });

})(jQuery, DebuggerUi.View.CodeView);

