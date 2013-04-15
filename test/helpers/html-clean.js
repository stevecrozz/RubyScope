/*global jQuery: false */

/**
 * a helpful method for testing DOM node contents by extracting only text
 */
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

