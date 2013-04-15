/*global RubyScope:false*/
/**
 * @module RubyScope
 * @namespace RubyScope
 * @requires jQuery
 */
(function(window, $, RubyScope){

  /**
   * Provides the ConnectionDialog class
   *
   * Suitable for providing the user with a dialog interface for entering
   * connection details.
   *
   * @class ConnectionDialog
   * @constructor
   */
  RubyScope.ConnectionDialog = function(){
    var dialog = this;

    this.setError = this.setError.bind(this);
    this.clearError = this.clearError.bind(this);
    this.center = this.center.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.disable = this.disable.bind(this);
    this.enable = this.enable.bind(this);
    this.getHost = this.getHost.bind(this);
    this.getPort = this.getPort.bind(this);
    this.submit = this.submit.bind(this);

    this.container = $('<section class="disconnected">');
    this.form = $('<form class="connect" method="post">').appendTo(this.container);
    this.error = $('<p class="error" style="display:none;">');

    var ol = $('<ol>').appendTo(this.form.append(this.error));
    $('<li>').appendTo(ol).append('<label for="host">Host</label>').
      append('<input name="host" type="text" value="localhost">');
    $('<li>').appendTo(ol).append('<label for="port">Port</label>').
      append('<input name="port" type="text" value="8989">');

    this.dialog = this.container.dialog({
      modal: true,
      resizable: false,
      title: "Connection Parameters",
      closeOnEscape: false,
      dialogClass: "connection-parameters",
      position: "center",
      buttons: [{
        text: "Connect",
        click: function(){
          dialog.form.submit();
        }
      }]
    });

    $(window).on("resize", function(){
      dialog.center();
    });

    this.submitButton = this.dialog.closest(".ui-dialog").find("button");
  };

  /**
   * Instruct ConnectionDialog to call your callback upon submitting the form
   *
   * @method submit
   * @param {Function} callback
   */
  RubyScope.ConnectionDialog.prototype.submit = function(callback){
    this.form.on("submit", callback);
  };

  /**
   * Display an error
   *
   * @method setError
   * @param {String} e an error
   */
  RubyScope.ConnectionDialog.prototype.setError = function(e){
    this.error.html(e).show();
  };

  /**
   * Clear the error
   *
   * @method clearError
   */
  RubyScope.ConnectionDialog.prototype.clearError = function(){
    this.error.empty().hide();
  };

  /**
   * Center the dialog
   *
   * @method center
   */
  RubyScope.ConnectionDialog.prototype.center = function(){
    this.dialog.dialog("option", "position", "center");
  };

  /**
   * Open the dialog
   *
   * @method open
   */
  RubyScope.ConnectionDialog.prototype.open = function(){
    this.dialog.dialog("open");
  };

  /**
   * Close the dialog
   *
   * @method close
   */
  RubyScope.ConnectionDialog.prototype.close = function(){
    this.dialog.dialog("close");
  };

  /**
   * Disable interaction with the dialog
   *
   * @method disable
   */
  RubyScope.ConnectionDialog.prototype.disable = function(){
    this.submitButton.button("disable");
  };

  /**
   * Enable interaction with the dialog
   *
   * @method enable
   */
  RubyScope.ConnectionDialog.prototype.enable = function(){
    this.submitButton.button("enable");
  };

  /**
   * Get the host value from the form
   *
   * @method getHost
   * @return {String} host
   */
  RubyScope.ConnectionDialog.prototype.getHost = function(){
    return this.form.find("input[name=host]").val();
  };

  /**
   * Get the port from the form
   *
   * @method getPort
   * @return {Number} port
   */
  RubyScope.ConnectionDialog.prototype.getPort = function(){
    return window.parseInt(
      this.form.find("input[name=port]").val(), 10
    );
  };

})(window, jQuery, RubyScope);
