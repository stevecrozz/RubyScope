/*global jQuery:false*/
/*global RubyScope:false*/
/*global RubyDebugClient:false*/
/*global DebuggerUi:false*/
/**
 * Provides the RubyScope.System class
 *
 * RubyScope.System binds RubyDebugClient to DebuggerUi. It manages the
 * connection to the debugger at the highest level and describes way UI
 * elements are bound to the Layout.
 *
 * @module RubyScope
 * @namespace RubyScope
 * @requires jQuery
 * @requires RubyScope
 * @requires RubyDebugClient
 * @requires DebuggerUi
 */
(function($, RubyScope, RubyDebugClient, DebuggerUi){

  /**
   * Creates an instance of the system
   *
   * @class System
   * @constructor
   * @param {Object} container jQuery-wrapped DOM node to attach the layout.
   */
  RubyScope.System = function(container){
    this.attemptConnection = this.attemptConnection.bind(this);
    this.timeout = this.timeout.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);

    this.layout = new RubyScope.Layout(container);
    this.connectionDialog = new RubyScope.ConnectionDialog();
    this.connectionDialog.submit(this.attemptConnection);
  };

  /**
   * Get the host for the connection
   *
   * @method getHost
   */
  RubyScope.System.prototype.getHost = function(){
    return this.connectionDialog.getHost();
  };

  /**
   * Get the port for the connection
   *
   * @method getPort
   */
  RubyScope.System.prototype.getPort = function(){
    return this.connectionDialog.getPort();
  };

  /**
   * Handle a connection timeout
   *
   * @method timeout
   */
  RubyScope.System.prototype.timeout = function(){
    this.connectionDialog.enable();
    this.connectionDialog.setError("Connection timed out.");
  };

  /**
   * Handle a disconnect by prompting for a new connection
   *
   * @method disconnect
   */
  RubyScope.System.prototype.disconnect = function(){
    this.connectionDialog.open();
    this.connectionDialog.enable();
  };

  /**
   * Handle a connection by closing the dialog an refreshing the DebuggerUi
   * instance
   *
   * @method connect
   */
  RubyScope.System.prototype.connect = function(){
    this.connectionDialog.close();
    this.ui.refresh();
  };

  /**
   * Visually prepare the connection attempt
   *
   * @method prepareConnectionAttempt
   */
  RubyScope.System.prototype.prepareConnectionAttempt = function(){
    this.layout.clear();
    this.connectionDialog.clearError();
    this.connectionDialog.disable();
  };

  /**
   * Builds the RubyDebugClient
   *
   * @method buildClient
   */
  RubyScope.System.prototype.buildClient = function(){
    this.rdc = new RubyDebugClient(this.getHost(), this.getPort(), {
      connect: this.connect,
      disconnect: this.disconnect,
      timeout: this.timeout
    });
  };

  /**
   * Gets the RubyDebugClientAdapter
   *
   * @method getAdapter
   */
  RubyScope.System.prototype.buildAdapter = function(){
    this.adapter = DebuggerUi.Adapter.RubyDebugClientAdapter(this.rdc);
  };

  /**
   * Builds the DebuggerUi
   *
   * @method buildUi
   */
  RubyScope.System.prototype.buildUi = function(){
    this.ui = new DebuggerUi({
      adapter: this.adapter,
      views: [
        {
          view: DebuggerUi.View.StackView,
          parameters: [ this.layout.detailsPane ]
        }, {
          view: DebuggerUi.View.BreakpointView,
          parameters: [ this.layout.detailsPane ]
        }, {
          view: DebuggerUi.View.ThreadView,
          parameters: [ this.layout.detailsPane ]
        }, {
          view: DebuggerUi.View.FileView,
          parameters: [ this.layout.detailsPane ]
        }, {
          view: DebuggerUi.View.ConsoleView,
          parameters: [ this.layout.consolePane ]
        }, {
          view: DebuggerUi.View.CodeView,
          parameters: [ this.layout.contentPane, "ruby" ]
        }, {
          view: DebuggerUi.View.ControlView,
          parameters: [ this.layout.controlPane, this.controls ]
        }, {
          view: DebuggerUi.View.ControlView,
          parameters: [ this.layout.controlPane, [{
            label: "Reconnect",
            action: this.rdc.disconnect
          }]]
        }
      ]
    });
  };

  /**
   * Initiate the connection to the debugger and tie it to the UI
   *
   * @method attemptConnection
   */
  RubyScope.System.prototype.attemptConnection = function(){
    this.prepareConnectionAttempt();
    this.buildClient();
    this.buildAdapter();
    this.buildUi();

    // connect!
    this.rdc.connect();

    return false;
  };

  RubyScope.System.prototype.controls = [
    { label: "Continue", action: "cont" },
    { label: "Next", action: "next" },
    { label: "Step", action: "step" },
    { label: "Up", action: "up" },
    { label: "Down", action: "down" }
  ];

})(jQuery, RubyScope, RubyDebugClient, DebuggerUi);
