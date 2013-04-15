/*global jQuery:false */
/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global DebuggerUi:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global sinon:false */
(function($, ConsoleView) {

  module("ConsoleView#new", {});

  test("constructs a CommandPrompt bound to the container", function(){
    var ui = {};
    var parent = $("<div>");
    var view = new ConsoleView(ui, parent);

    deepEqual(
      view.commandPrompt.givenArguments,
      [parent],
      "commandPrompt is given the right arguments"
    );
  });

  test("establishes a callback to watch for commands", function(){
    var ui = {
      requestHandlers: {
        evaluate: sinon.spy()
      }
    };

    var spy = ui.requestHandlers.evaluate;
    var parent = $("<div>");
    var view = new ConsoleView(ui, parent);

    view.commandPrompt.handleCommand("SOME COMMAND");

    deepEqual(
      spy.args[0],
      ["SOME COMMAND", view.commandPrompt.handleResponse],
      "binds the command handler and passes the response handler when called"
    );
  });

})(jQuery, DebuggerUi.View.ConsoleView);

