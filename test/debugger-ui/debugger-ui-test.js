/*global jQuery:false */
/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global DebuggerUi:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global sinon:false */
(function($, DebuggerUi) {

  module("DebuggerUi#new", {});

  test("instantiates a DebuggerUi given an empty adapter", 3, function(){
    var dui = new DebuggerUi({ adapter: {}, views: {} });
    strictEqual(dui.requestHandlers, undefined, "no request handlers defined");
    strictEqual(dui.dataProviders, undefined, "no data providers defined");
    strictEqual(dui.dataProviderMap, undefined, "no data provider map defined");
  });

  test("instantiates a DebuggerUi with a proper adapter", 3, function(){
    var dui = new DebuggerUi({
      adapter: {
        requestHandlers: "handlers",
        dataProviders: "providers",
        dataProviderMap: "map"
      },
      views: {}
    });

    strictEqual(dui.requestHandlers, "handlers", "request handlers defined");
    strictEqual(dui.dataProviders, "providers", "data providers defined");
    strictEqual(dui.dataProviderMap, "map", "data provider map defined");
  });

  test("new DebuggerUi has no views", 1, function(){
    var dui = new DebuggerUi({ adapter: {}, views: {} });
    deepEqual(dui.views, [], "has no views");
  });

  module("DebuggerUi#installViews", {});

  test("installs some views", 2, function(){
    var view = sinon.spy();
    var views = [
      { view: view, parameters: [ "0ne", "tw0" ] }
    ];
    var dui = new DebuggerUi({ adapter: {}, views: views });

    strictEqual(view.called, true, "view is initialized");
    deepEqual(view.args[0], [ dui, "0ne", "tw0" ], "view is given the right params");
  });

  module("DebuggerUi#provideData", {
    setup: function() {
      this.dui = new DebuggerUi({
        adapter: {
          dataProviders: {
            pone: function(dataPoints, deferred){
              dataPoints.rone = "111";
              dataPoints.rtwo = "22!";
              deferred.resolve();
            },
            ptwo: function(dataPoints, deferred){
              dataPoints.rthree = "3!!";
              deferred.resolve();
            }
          },
          dataProviderMap: {
            rone: "pone",
            rtwo: "pone",
            rthree: "ptwo"
          }
        },
        views: []
      });
    }
  });

  test("gets a single data point", 1, function(){
    var dataPoints = {};
    this.dui.provideData(["rthree"], dataPoints).done(function(){
      strictEqual(dataPoints.rthree, "3!!");
    });
  });

  test("gets data from two providers", 2, function(){
    var dataPoints = {};
    this.dui.provideData(["rthree", "rtwo"], dataPoints).done(function(){
      strictEqual(dataPoints.rthree, "3!!");
      strictEqual(dataPoints.rtwo, "22!");
    });
  });

  test("respects resolved deferred", 1, function(){
    var deferreds = { ptwo: new $.Deferred() };
    var dataPoints = {};

    this.dui.provideData(["rthree"], dataPoints, deferreds).done(function(){
      // Data is unchanged because providing a deferred causes DebuggerUi to
      // not request data from the provider
      strictEqual(dataPoints.rthree, "bogus");
    });

    dataPoints.rthree = "bogus";
    deferreds.ptwo.resolve();
  });

  module("DebuggerUi#refresh", {});

  test("refreshes all the registered views", 3, function(){
    var dui = new DebuggerUi({ adapter: {}, views: {} });
    dui.refreshView = sinon.spy();
    dui.views = ["oneview", "twoview"];
    dui.refresh();
    strictEqual(dui.refreshView.calledTwice, true, "calls for both views");
    deepEqual(dui.refreshView.args[0], ["oneview", {}, {}]);
    deepEqual(dui.refreshView.args[1], ["twoview", {}, {}]);
  });

  module("DebuggerUi#refreshView", {
    setup: function() {
      this.dui = new DebuggerUi({ adapter: {}, views: {} });
      this.view = { render: sinon.spy() };
    }
  });

  test("renders a view with no data requirements", 5, function(){
    var deferred = $.Deferred();
    deferred.resolve();

    this.dataProvider = function(){ return deferred; };
    sinon.stub(this.dui, "provideData", this.dataProvider);

    this.dui.refreshView(this.view);
    strictEqual(this.dui.provideData.calledOnce, true, "calls #provideData once");
    deepEqual(this.dui.provideData.args[0], [[], {}, {}], "#provideData correct params");

    strictEqual(this.view.render.calledOnce, true, "renders view");
    strictEqual(this.view.render.calledOn(this.view), true, "renders with view context");
    deepEqual(this.view.render.args[0], [], "renders with no arguments");
  });

  test("renders a view with some data requirements", 6, function(){
    var deferred = $.Deferred();
    deferred.resolve();
    this.dataProvider = function(){ return deferred; };
    sinon.stub(this.dui, "provideData", this.dataProvider);

    this.view.dataRequirements = ["some", "requirements"];

    this.dui.refreshView(this.view, {
      some: "somefilled",
      requirements: 12345
    }, "BLAH");

    strictEqual(this.dui.provideData.calledOnce, true, "calls #provideData once");
    deepEqual(this.dui.provideData.args[0][0], ["some", "requirements"], "#provideData correct requirements");
    deepEqual(this.dui.provideData.args[0][2], "BLAH", "#provideData correct deferreds");

    strictEqual(this.view.render.calledOnce, true, "renders view");
    strictEqual(this.view.render.calledOn(this.view), true, "renders with view context");
    deepEqual(this.view.render.args[0], ["somefilled", 12345], "renders with arguments");
  });

}(jQuery, DebuggerUi));
