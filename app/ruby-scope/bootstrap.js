/*global jQuery:false*/
/*global RubyScope:false*/
(function($, RubyScope){

  // DOM is ready, start the RubyScope system
  $(function(){
    new RubyScope.System($("#ruby-scope"));
  });

})(jQuery, RubyScope);
