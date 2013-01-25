/**
 * In case the test environment doesn't have Function.prototype.bind
 *
 * copied from:
 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
 */
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      FNOP = function () {},
      fBound = function () {
        return fToBind.apply(this instanceof FNOP && oThis ? this : oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
      };

    FNOP.prototype = this.prototype;
    fBound.prototype = new FNOP();

    return fBound;
  };
}

jQuery.fn.htmlClean = function() {
  this.contents().filter(function() {
    if (this.nodeType !== 3) {
      jQuery(this).htmlClean();
      return false;
    }
    else {
      return !/\S/.test(this.nodeValue);
    }
  }).remove();
  return this;
};