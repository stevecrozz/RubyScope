/*global jQuery:false */
/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global RubyScope:false */
/*global sinon:false */
(function($) {

  var cdmodule = {
    setup: function(){
      this.cd = new RubyScope.ConnectionDialog();
    },

    teardown: function(){
      $(window).off();
    }
  };

  module("ConnectionDialog#initialize", cdmodule);

  test("creates the dialog", 9, function() {
    strictEqual($.fn.dialog.thisValues[0], this.cd.container, "calls dialog with proper context");

    var dialogOpts = $.fn.dialog.args[0][0];
    var buttons = dialogOpts.buttons;
    dialogOpts.buttons = undefined;

    strictEqual(dialogOpts.modal, true, "is a modal dialog");
    strictEqual(dialogOpts.resizable, false, "is not resizable");
    strictEqual(dialogOpts.title, "Connection Parameters", "has the right title");
    strictEqual(dialogOpts.closeOnEscape, false, "doesn't close on escape key");
    strictEqual(dialogOpts.dialogClass, "connection-parameters", "has the right css class");
    strictEqual(dialogOpts.position, "center", "is centered");

    strictEqual(buttons[0].text, "Connect", "has a connect button");

    this.cd.form.submit = sinon.spy();
    buttons[0].click();

    strictEqual(this.cd.form.submit.called, true, "clicking connect submits the form");
  });

  test("monitors resize events", 1, function(){
    this.cd.center = sinon.spy();

    // some browsers trigger resize events without a resize, so don't count those
    var callCount = this.cd.center.callCount;

    // trigger another resize and make sure it called #center
    $(window).trigger("resize");
    strictEqual(this.cd.center.callCount, callCount + 1, "calls #center when resized");
  });

  test("gets a handle on the submit button", 1, function(){
    strictEqual(this.cd.submitButton, "somebuTTon", "has the button");
  });

  module("ConnectionDialog#submit", cdmodule);

  test("calls the callback on submission", 1, function(){
    // need to create our own custom spy so it can stop the event
    var called = false;
    var spy = function(){
      called = true;
      return false;
    };
    this.cd.submit(spy);
    this.cd.form.submit();
    strictEqual(called, true, "submit callback is called");
  });

  module("ConnectionDialog#setError", cdmodule);

  test("sets an error", 1, function(){
    this.cd.setError("you did bad things");
    strictEqual(this.cd.error.html(), "you did bad things", "errors are set");
  });

  module("ConnectionDialog#clearError", cdmodule);

  test("clears an error", 1, function(){
    this.cd.form.html("this shouldn't be here");
    this.cd.clearError();
    strictEqual(this.cd.error.html(), "", "errors are gone");
  });

  module("ConnectionDialog#center", cdmodule);

  test("centers the dialog", 1, function(){
    this.cd.dialog.dialog = sinon.spy();
    this.cd.center();
    deepEqual(this.cd.dialog.dialog.args[0], [
      "option",
      "position",
      "center"
    ], "centers the dialog");
  });

  module("ConnectionDialog#open", cdmodule);

  test("opens the dialog", 1, function(){
    this.cd.dialog.dialog = sinon.spy();
    this.cd.open();
    strictEqual(this.cd.dialog.dialog.args[0][0], "open", "opens the dialog");
  });

  module("ConnectionDialog#close", cdmodule);

  test("closes the dialog", 1, function(){
    this.cd.dialog.dialog = sinon.spy();
    this.cd.close();
    strictEqual(this.cd.dialog.dialog.args[0][0], "close", "closes the dialog");
  });

  module("ConnectionDialog#disable", cdmodule);

  test("disables the dialog", 1, function(){
    this.cd.submitButton = {
      button: sinon.spy()
    };
    this.cd.disable();
    strictEqual(this.cd.submitButton.button.args[0][0], "disable", "disables the dialog button");
  });

  module("ConnectionDialog#enable", cdmodule);

  test("enables the dialog", 1, function(){
    this.cd.submitButton = {
      button: sinon.spy()
    };
    this.cd.enable();
    strictEqual(this.cd.submitButton.button.args[0][0], "enable", "enables the dialog button");
  });

  module("ConnectionDialog#getHost", cdmodule);

  test("gets the host name from the form", 1, function(){
    this.cd.form.find("[name=host]").val("myhost.com");
    var host = this.cd.getHost();
    strictEqual(host, "myhost.com", "gets the host");
  });

  module("ConnectionDialog#getPort", cdmodule);

  test("gets the port from the form", 1, function(){
    this.cd.form.find("[name=port]").val("9990");
    var host = this.cd.getPort();
    strictEqual(host, 9990, "gets the port");
  });

}(jQuery));
