/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

  module('RubyDebugClient#new', {
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('sets host', 1, function() {
    var rdc = new RubyDebugClient("somehost", "someport");
    strictEqual(rdc.host, "somehost", 'host is set');
  });

  test('sets port', 1, function() {
    var rdc = new RubyDebugClient("somehost", "someport");
    strictEqual(rdc.port, "someport", 'port is set');
  });

}(jQuery));
