/*global jQuery:false*/
/*global RubyScope:false*/
/*global RubyDebugClient:false*/
/*global DebuggerUi:false*/
(function($, RubyScope, RubyDebugClient, DebuggerUi){

  RubyScope.System = function(container){
    this.attemptConnection = this.attemptConnection.bind(this);
    this.timeout = this.timeout.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);

    this.layout = new RubyScope.Layout(container);
    this.connectionDialog = new RubyScope.ConnectionDialog();
    this.connectionDialog.submit(this.attemptConnection);
  };

  RubyScope.System.prototype.getHost = function(){
    return this.connectionDialog.getHost();
  };

  RubyScope.System.prototype.getPort = function(){
    return this.connectionDialog.getPort();
  };

  RubyScope.System.prototype.timeout = function(){
    this.connectionDialog.enable();
    this.connectionDialog.setError("Connection timed out.");
  };

  RubyScope.System.prototype.disconnect = function(){
    this.connectionDialog.open();
    this.connectionDialog.enable();
  };

  RubyScope.System.prototype.connect = function(){
    this.connectionDialog.close();
    this.ui.refresh();
  };

  RubyScope.System.prototype.attemptConnection = function(){

    this.layout.clear();
    this.connectionDialog.clearError();
    this.connectionDialog.disable();

    this.rdc = new RubyDebugClient(this.getHost(), this.getPort(), {
      connect: this.connect,
      disconnect: this.disconnect,
      timeout: this.timeout
    });

    this.ui = new DebuggerUi({
      adapter: DebuggerUi.Adapter.RubyDebugClientAdapter(this.rdc),
      views: [
        {
          view: DebuggerUi.View.StackView,
          parameters: [ this.layout.detailsPane ]
        },
        {
          view: DebuggerUi.View.BreakpointView,
          parameters: [ this.layout.detailsPane ]
        },
        {
          view: DebuggerUi.View.ThreadView,
          parameters: [ this.layout.detailsPane ]
        },
        {
          view: DebuggerUi.View.FileView,
          parameters: [ this.layout.detailsPane ]
        },
        {
          view: DebuggerUi.View.ConsoleView,
          parameters: [ this.layout.consolePane ]
        },
        {
          view: DebuggerUi.View.CodeView,
          parameters: [ this.layout.contentPane, "ruby" ]
        },
        {
          view: DebuggerUi.View.ControlView,
          parameters: [ this.layout.controlPane, [
            { label: "Continue", action: "cont" },
            { label: "Next", action: "next" },
            { label: "Step", action: "step" },
            { label: "Up", action: "up" },
            { label: "Down", action: "down" }
          ]]
        }
      ]
    });

    // Add a reconnect button
    $("<span class=\"status\">").append(
      $("<a href=\"#\">Reconnect</a>").button().on("click", function(){
        rdc.disconnect();
      })
    ).appendTo(this.layout.controlPane);

    this.rdc.connect();

    return false;
  };

})(jQuery, RubyScope, RubyDebugClient, DebuggerUi);
