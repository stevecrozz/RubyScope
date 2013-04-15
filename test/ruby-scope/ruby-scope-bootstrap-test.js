/*global jQuery:false */
/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global RubyScope:false */
(function($) {

  module("RubyScope", {});

  test("Calls new RubyScope.System() on load", 1, function() {

    strictEqual(RubyScope.System.args[0][0].text(), "YouGotIt!");

  });

}(jQuery));
