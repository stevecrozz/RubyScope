/*global DebuggerUi:false*/
/**
 * Exports the ConsoleView which provides an interactive console
 *
 * @module DebuggerUi
 * @namespace DebuggerUi.View
 */
(function($, DebuggerUi, CommandPrompt){

  /**
   * @class ConsoleView
   * @constructor
   * @param {DebuggerUi} ui DebuggerUi instance
   * @param {Object} parent jQuery wrapped set container
   */
  DebuggerUi.View.ConsoleView = function(ui, parent){
    var commandPrompt = new CommandPrompt(parent);
    this.commandPrompt = commandPrompt;

    // Listen for commands entered by defining the handleCommand callback
    // function on commandPrompt. When a commmand is entered, dispatch it to
    // the request handler and pass along to commandPrompt's response handler.
    this.commandPrompt.handleCommand = function(command){
      ui.requestHandlers.evaluate(command, commandPrompt.handleResponse);
    };
  };

  /**
   * In this view there isn't anything to do, but ConsoleView respects the
   * interface and provides an empty function.
   *
   * @method render
   */
  DebuggerUi.View.ConsoleView.prototype.render = function(){};

})(jQuery, DebuggerUi, CommandPrompt);
