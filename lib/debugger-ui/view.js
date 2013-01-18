/*global DebuggerUi:false*/
(function(DebuggerUi){

  DebuggerUi.View = function(){
  };

  DebuggerUi.View.BuildView = function(view, args){
    var ViewBuilder = function(args){ return view.apply(this, args); };
    ViewBuilder.prototype = view.prototype;
    return new ViewBuilder(args);
  };

})(DebuggerUi);

