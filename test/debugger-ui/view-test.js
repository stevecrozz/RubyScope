/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global DebuggerUi:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($, DebuggerUi) {

  module("DebuggerUi.View#BuildView", {
    setup: function() {
      var testContext = this;
      this.initializedMyView = false;

      this.MyView = function(){
        this.args = [];
        testContext.initializedMyView = true;

        var i;
        for (i=0;i<arguments.length;i++){
          this.args.push(arguments[i]);
        }
      };
    }
  });

  test("builds views with no arguments", 3, function(){
    var view = DebuggerUi.View.BuildView(this.MyView);

    strictEqual(this.initializedMyView, true, "view is called");
    deepEqual(view.args, [], "view is given no arguments");
    strictEqual(view.constructor, this.MyView, "view has the right constructor");
  });

  test("builds views with arguments", 3, function(){
    var view = DebuggerUi.View.BuildView(this.MyView, [5,4,0]);

    strictEqual(this.initializedMyView, true, "view is called");
    deepEqual(view.args, [5,4,0], "view is given no arguments");
    strictEqual(view.constructor, this.MyView, "view has the right constructor");
  });

}(jQuery, DebuggerUi));
