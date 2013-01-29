/*global RubyScope:false*/
(function(window, RubyScope){

  RubyScope.ConnectionDialog = function(){
    var dialog = this;

    this.error = $(".disconnected .error");

    this.form = $(".disconnected form");

    this.dialog = $(".disconnected").dialog({
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

    $(window).on("resize", function(){
      dialog.center();
    });

    this.submitButton = this.dialog.closest(".ui-dialog").find("button");
  };

  RubyScope.ConnectionDialog.prototype.submit = function(callback){
    this.form.on("submit", callback);
  };

  RubyScope.ConnectionDialog.prototype.setError = function(e){
    this.error.html(e).show();
  };

  RubyScope.ConnectionDialog.prototype.clearError = function(){
    this.error.empty().hide();
  };

  RubyScope.ConnectionDialog.prototype.center = function(){
    this.dialog.dialog("option", "position", "center");
  };

  RubyScope.ConnectionDialog.prototype.open = function(){
    this.dialog.dialog("open");
  };

  RubyScope.ConnectionDialog.prototype.close = function(){
    this.dialog.dialog("close");
  };

  RubyScope.ConnectionDialog.prototype.disable = function(){
    this.submitButton.button("disable");
  };

  RubyScope.ConnectionDialog.prototype.enable = function(){
    this.submitButton.button("enable");
  };

  RubyScope.ConnectionDialog.prototype.getHost = function(){
    return this.form.find("input[name=host]").val();
  };

  RubyScope.ConnectionDialog.prototype.getPort = function(){
    return window.parseInt(
      this.form.find("input[name=port]").val(), 10
    );
  };

})(window, RubyScope);
