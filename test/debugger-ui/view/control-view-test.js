/*global jQuery:false */
/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global DebuggerUi:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global sinon:false */
(function($, ControlView) {

  module("ControlView#new", {});

  test("throws an exception when there are no requestHandlers", function(){
    var ui = {};
    var parent = $("<div>");
    var throwsException = false;

    try {
      var view = new ControlView(ui, parent);
    } catch(e) {
      if (e.message === "no request handlers found") {
        throwsException = true;
      }
    }

    strictEqual(throwsException, true, "throws an exception");
  });

  test("throws an exception when request handler is missing", function(){
    var ui = { requestHandlers: {} };
    var parent = $("<div>");
    var throwsException = false;

    try {
      var view = new ControlView(ui, parent, [
        { action: "what", label: "What" }
      ]);
    } catch(e) {
      if (e.message.match(/missing request handler/)){
        throwsException = true;
      }
    }

    strictEqual(throwsException, true, "throws an exception");
  });

  test("renders an empty set of buttons", function(){
    var ui = { requestHandlers: {} };
    var parent = $("<div>");
    var view = new ControlView(ui, parent);

    var expected = $("#control-1").htmlClean().html();
    var actual = parent.htmlClean().html();
    strictEqual(actual, expected, "there are no buttons");
  });

  test("renders some buttons", function(){
    var ui = { requestHandlers: {
      what: function(){},
      someaction: function(){}
    } };
    var parent = $("<div>");
    var view = new ControlView(ui, parent, [
      { action: "what", label: "What" },
      { action: "someaction", label: "Some Action" }
    ]);

    var buttonTexts = parent.find("a").map(function(){
      return $(this).text();
    }).toArray();

    deepEqual(["What", "Some Action"], buttonTexts, "buttons have the right text");
  });

  test("uses icons when they're available", function(){
    var ui = { requestHandlers: {
      cont: function(){}
    } };
    var parent = $("<div>");
    var view = new ControlView(ui, parent, [
      { action: "cont", label: "What" }
    ]);

    var hasIcon = parent.find("a").find(".ui-button-icon-primary").
      hasClass("ui-icon-play");

    strictEqual(hasIcon, true, "button has the right icon");
  });

  test("calls the request handler when button is clicked", function(){
    var spy = sinon.spy();
    var ui = {
      requestHandlers: {
        cont: spy
      },
      refresh: function(){}
    };

    var parent = $("<div>");
    var view = new ControlView(ui, parent, [
      { action: "cont", label: "What" }
    ]);

    strictEqual(spy.called, false, "request handler is not called");
    parent.find("a").first().click();
    strictEqual(spy.called, true, "request is called");
  });

  test("refreshes the UI on every action", function(){
    var spy = sinon.spy();
    var ui = {
      requestHandlers: {
        cont: function(){}
      },
      refresh: spy
    };

    var parent = $("<div>");
    var view = new ControlView(ui, parent, [
      { action: "cont", label: "What" }
    ]);

    strictEqual(spy.called, false, "doesn't refresh the UI");
    parent.find("a").first().click();
    strictEqual(spy.called, true, "refreshes the UI");
  });

})(jQuery, DebuggerUi.View.ControlView);

