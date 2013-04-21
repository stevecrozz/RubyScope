/*global jQuery:false */
/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global RubyScope:false */
/*global sinon:false */
(function($) {

  module("#initialize", {
    setup: function(){
      window.RubyScope.Layout.reset();
      window.dialogSpy.submit.reset();
      window.RubyScope.ConnectionDialog.reset();
      window.RubyDebugClient.reset();
      window.DebuggerUi.reset();
    }
  });

  test("initializes the layout", 3, function() {
    var system = new RubyScope.System("foo");
    equal(RubyScope.Layout.calledWithNew(), true, "creates a new layout");
    equal(RubyScope.Layout.args[0][0], "foo", "passes layout the container");
    equal(system.layout instanceof RubyScope.Layout, true, "holds the layout instance");
  });

  test("initializes the dialog", 2, function() {
    var system = new RubyScope.System();
    equal(RubyScope.ConnectionDialog.calledWithNew(), true, "creates a new dialog");
    equal(system.connectionDialog, window.dialogSpy, "holds the dialog instance");
  });

  test("binds to the dialog submit event", 1, function() {
    var system = new RubyScope.System();
    equal(system.connectionDialog.submit.args[0][0], system.attemptConnection, "binds attemptConnection to dialog submit");
  });

  module("#getHost");

  test("gets the host from the dialog", 1, function(){
    var system = new RubyScope.System();
    system.connectionDialog.getHost = sinon.stub().returns("hostage");

    equal(system.getHost(), "hostage", "gets the right host");
  });

  module("#getPort");

  test("gets the port from the dialog", 1, function(){
    var system = new RubyScope.System();
    system.connectionDialog.getPort = sinon.stub().returns("portage");

    equal(system.getPort(), "portage", "gets the right port");
  });

  module("#timeout");

  test("re-enables the connectionDialog", 1, function(){
    var system = new RubyScope.System();
    system.connectionDialog = {
      enable: sinon.spy(),
      setError: function(){}
    };
    system.timeout();

    equal(system.connectionDialog.enable.called, true, "re-enables the connectionDialog");
  });

  test("sets a meaningful error on the dialog", 1, function(){
    var system = new RubyScope.System();
    system.connectionDialog = {
      enable: function(){},
      setError: sinon.spy()
    };
    system.timeout();

    equal(system.connectionDialog.setError.args[0][0], "Connection timed out.", "sets a meaningful error on the dialog");
  });

  module("#disconnect");

  test("opens the dialog", 1, function(){
    var system = new RubyScope.System();
    system.connectionDialog = {
      open: sinon.spy(),
      enable: function(){}
    };
    system.disconnect();

    equal(system.connectionDialog.open.called, true, "opens the dialog");
  });

  test("enables the dialog", 1, function(){
    var system = new RubyScope.System();
    system.connectionDialog = {
      open: function(){},
      enable: sinon.spy()
    };
    system.disconnect();

    equal(system.connectionDialog.enable.called, true, "enables the dialog");
  });

  module("#connect");

  test("closes the dialog", 1, function(){
    var system = new RubyScope.System();
    system.connectionDialog = { close: sinon.spy() };
    system.ui = { refresh: function(){} };
    system.connect();

    equal(system.connectionDialog.close.called, true, "closes the dialog");
  });

  test("refreshes the ui", 1, function(){
    var system = new RubyScope.System();
    system.connectionDialog = { close: function(){} };
    system.ui = { refresh: sinon.spy() };
    system.connect();

    equal(system.ui.refresh.called, true, "refreshes the ui");
  });

  module("#prepareConnectionAttempt");

  test("clears the layout", 1, function(){
    var system = new RubyScope.System();
    system.layout = { clear: sinon.spy() };
    system.connectionDialog = {
      clearError: function(){},
      disable: function(){}
    };
    system.prepareConnectionAttempt();

    equal(system.layout.clear.called, true, "clears the layout");
  });

  test("clears the errors", 1, function(){
    var system = new RubyScope.System();
    system.layout = { clear: function(){} };
    system.connectionDialog = {
      clearError: sinon.spy(),
      disable: function(){}
    };
    system.prepareConnectionAttempt();

    equal(system.connectionDialog.clearError.called, true, "clears the errors");
  });

  test("disables the dialog", 1, function(){
    var system = new RubyScope.System();
    system.layout = { clear: function(){} };
    system.connectionDialog = {
      clearError: function(){},
      disable: sinon.spy()
    };
    system.prepareConnectionAttempt();

    equal(system.connectionDialog.disable.called, true, "disables the dialog");
  });

  module("#buildClient");

  test("builds the client", 4, function(){
    var system = new RubyScope.System();
    window.RubyDebugClient.reset();

    system.getHost = sinon.stub().returns("somehost");
    system.getPort = sinon.stub().returns("someport");
    var callbacks = {
      connect: system.connect,
      disconnect: system.disconnect,
      timeout: system.timeout
    };

    system.buildClient();
    var args = window.RubyDebugClient.args[0];

    equal(args[0], "somehost");
    equal(args[1], "someport");
    deepEqual(args[2], callbacks);
    equal(system.rdc instanceof window.RubyDebugClient, true, "saves the client");
  });

  module("#buildAdapter");

  test("builds the adapter", 2, function(){
    window.DebuggerUi.Adapter.RubyDebugClientAdapter.reset();
    window.DebuggerUi.Adapter.RubyDebugClientAdapter.returns("anadapter");
    var system = new RubyScope.System();
    system.rdc = "someclient";
    system.buildAdapter();

    equal(window.DebuggerUi.Adapter.RubyDebugClientAdapter.args[0][0], "someclient", "passes the client to the adapter");
    equal(system.adapter, "anadapter", "saves the adapter");
  });

  module("#buildUi");

  test("builds the ui", 10, function(){
    window.DebuggerUi.reset();
    window.DebuggerUi.View = {
      StackView: "mystackview",
      BreakpointView: "mybreakpointview",
      ThreadView: "mythreadview",
      FileView: "myfileview",
      ConsoleView: "myconsoleview",
      CodeView: "mycodeview",
      ControlView: "mycontrolview"
    };

    var system = new RubyScope.System();
    system.adapter = "awesomeadapter";
    system.layout.detailsPane = "superdetailspane";
    system.layout.consolePane = "uberconsolepane";
    system.layout.contentPane = "greatcontentpane";
    system.layout.controlPane = "bestcontrolpane";
    system.controls = "incrediblecontrols";
    system.rdc = { disconnect: "diskonnektor" };
    system.buildUi();
    var arg = window.DebuggerUi.args[0][0];

    equal(arg.adapter, "awesomeadapter", "sends the adapter to the ui");
    deepEqual(arg.views[0], {
      view: "mystackview",
      parameters: [ "superdetailspane" ]
    }, "includes the stack view");
    deepEqual(arg.views[1], {
      view: "mybreakpointview",
      parameters: [ "superdetailspane" ]
    }, "includes the breakpoint view");
    deepEqual(arg.views[2], {
      view: "mythreadview",
      parameters: [ "superdetailspane" ]
    }, "includes the thread view");
    deepEqual(arg.views[3], {
      view: "myfileview",
      parameters: [ "superdetailspane" ]
    }, "includes the file view");
    deepEqual(arg.views[4], {
      view: "myconsoleview",
      parameters: [ "uberconsolepane" ]
    }, "includes the console view");
    deepEqual(arg.views[5], {
      view: "mycodeview",
      parameters: [ "greatcontentpane", "ruby" ]
    }, "includes the code view");
    deepEqual(arg.views[6], {
      view: "mycontrolview",
      parameters: [ "bestcontrolpane", "incrediblecontrols" ]
    }, "includes the control view");
    deepEqual(arg.views[7], {
      view: "mycontrolview",
      parameters: [
        "bestcontrolpane", [{
          label: "Reconnect",
          action: "diskonnektor"
        }]
      ]
    }, "includes the secondary control view");
    equal(system.ui instanceof window.DebuggerUi, true, "saves the ui");
  });

  module("#attemptConnection");

  test("prepares the system and calls connect", 6, function(){
    var system = new RubyScope.System();
    system.prepareConnectionAttempt = sinon.spy();
    system.buildClient = sinon.spy();
    system.buildAdapter = sinon.spy();
    system.buildUi = sinon.spy();
    system.rdc = { connect: sinon.spy() };

    var retVal = system.attemptConnection();
    equal(system.prepareConnectionAttempt.called, true, "calls prepareConnectionAttempt");
    equal(system.buildClient.called, true, "calls buildClient");
    equal(system.buildAdapter.called, true, "calls buildAdapter");
    equal(system.buildUi.called, true, "calls buildUi");
    equal(system.rdc.connect.called, true, "calls rdc.connect");
    equal(retVal, false, "returns false");
  });

})(jQuery);
