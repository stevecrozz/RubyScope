/*global DebuggerUi:false*/
(function($, DebuggerUi){

  DebuggerUi.View.ConsoleView = function(ui, parent){
    ui.registerView(this);

    this.commandPrompt = new CommandPrompt(parent);

    var commandPrompt = this.commandPrompt;
    var responseHandler = commandPrompt.handleResponse.bind(commandPrompt);

    // Handle commands by sending them to this.evaluate and When we get a
    // response from an evaluate instruction, the commandPrompt should handle
    // it.
    this.commandPrompt.handleCommand = function(command){
      ui.requestHandlers.evaluate(command, responseHandler);
    };
  };

  DebuggerUi.View.ConsoleView.prototype.render = function(threads){};

})(jQuery, DebuggerUi);
