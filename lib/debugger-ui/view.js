/*global DebuggerUi:false*/
/**
 * @module DebuggerUi
 * @namespace DebuggerUi
 */
(function(DebuggerUi){

  /**
   * Namespace for all the view related DebuggerUi Code
   *
   * @class View
   */
  DebuggerUi.View = function(){
  };

  /**
   * Builder for creating instances of views given an array of arguments
   *
   * This builder exists because Function#apply cannot be used with plain
   * javascript initializers. The argument array needs to be passed as
   * arguments to the view's initializer.
   *
   * @method BuildView
   * @static
   * @param {Function} view View class to instantiate
   * @param {Array} args array of arguments to pass to the view's initializer
   * @return {Object} view object
   */
  DebuggerUi.View.BuildView = function(view, args){
    var ViewBuilder = function(args){ return view.apply(this, args); };
    ViewBuilder.prototype = view.prototype;
    return new ViewBuilder(args);
  };

})(DebuggerUi);

