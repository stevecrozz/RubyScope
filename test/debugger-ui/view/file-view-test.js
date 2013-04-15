/*global jQuery:false */
/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global DebuggerUi:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global sinon:false */
(function($, FileView) {

  module("FileView#new", {});

  test("attaches the empty list", function(){
    var ui = {};
    var parent = $("<div>");

    var view = new FileView(ui, parent);

    var expected = $("#file-1").htmlClean().html();
    var actual = parent.htmlClean().html();

    strictEqual(actual, expected, "list exists and is empty");
  });

  test("sets up file selection observer", function(){
    var ui = {};
    var parent = $("<div>");
    var spy = sinon.spy(FileView.prototype, "selectFile");
    var view = new FileView(ui, parent);
    var file = $("<li>").text("myFIIILE");

    parent.find("ul").append(file);
    file.trigger("click");

    strictEqual(spy.called, true, "calls selectFile on file clicks");

    FileView.prototype.selectFile.restore();
  });

  module("FileView#selectFile", {});

  test("handles file selections", function(){
    var ui = {};
    var parent = $("<div>");
    var view = new FileView(ui, parent);
    var file = $("<li>").text("SOMETEXT");
    var event = { target: file.get(0) };

    var eventTriggered = false;
    var dataProvided;
    $(ui).bind("fileSelect.dui", function(event, data){
      eventTriggered = true;
      dataProvided = data;
    });

    view.selectFile(event);

    strictEqual(eventTriggered, true, "triggers fileSelect event");
    strictEqual(dataProvided, "SOMETEXT", "passes corret filename");
    strictEqual(file.hasClass("current"), true, "sets the current class");
  });

  module("FileView#render", {});

  test("renders an empty list", function(){
    var ui = {};
    var parent = $("<div>");
    var view = new FileView(ui, parent);
    view.render([]);

    var expected = $("#file-1").htmlClean().html();
    var actual = parent.htmlClean().html();

    strictEqual(actual, expected, "list exists and is empty");
  });

  test("renders some files", function(){
    var ui = {};
    var parent = $("<div>");
    var view = new FileView(ui, parent);
    var files = [
      ["onefilename"],
      ["anotherfilename"],
      ["athirdfilename", "anothernamefor/filethree"]
    ];
    view.render(files, "anotherfilename");

    var expected = $("#file-2").htmlClean().html();
    var actual = parent.htmlClean().html();

    strictEqual(actual, expected, "list exists and is empty");
  });

})(jQuery, DebuggerUi.View.FileView);

