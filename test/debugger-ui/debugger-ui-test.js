/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global DebuggerUi:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($, DebuggerUi) {

  module("DebuggerUi#new", {});

  test("instantiates a DebuggerUi given an empty adapter", 3, function(){
    var dui = new DebuggerUi({ adapter: {} });
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
      }
    });

    strictEqual(dui.requestHandlers, "handlers", "request handlers defined");
    strictEqual(dui.dataProviders, "providers", "data providers defined");
    strictEqual(dui.dataProviderMap, "map", "data provider map defined");
  });

  test("new DebuggerUi has no views", 1, function(){
    var dui = new DebuggerUi({ adapter: {} });
    deepEqual(dui.views, [], "has no views");
  });

  module("DebuggerUi#registerView", {});

  test("registers a view", 2, function(){
    var dui = new DebuggerUi({ adapter: {} });
    dui.registerView("someview");
    strictEqual(dui.views.length, 1, "only one view is registered");
    strictEqual(dui.views[0], "someview", "the requested view is registered");
  });

}(jQuery, DebuggerUi));
