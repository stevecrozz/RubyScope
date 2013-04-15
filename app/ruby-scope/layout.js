/*global RubyScope:false*/
/*global jQuery:false*/
(function(window, $, RubyScope){

  RubyScope.Layout = function(parent){
    this.container = parent;

    this.detailsPane = $("<section class=\"pane details\">");
    this.controlPane = $("<section class=\"pane control\">");
    this.contentPane = $("<section class=\"pane content\">");
    this.consolePane = $("<section class=\"pane console\">");

    this.detailsPane.appendTo(this.container);
    this.controlPane.appendTo(this.container);
    this.contentPane.appendTo(this.container);
    this.consolePane.appendTo(this.container);

    this.panes = this.detailsPane.
      add(this.controlPane).
      add(this.contentPane).
      add(this.consolePane);

    this.resize = this.resize.bind(this);
    this.clear = this.clear.bind(this);

    $(window).on("resize", this.resize).trigger("resize");
  };

  RubyScope.Layout.prototype.resize = function(){
    var windowHeight = window.innerHeight;
    var consoleHeight = window.parseInt(
      this.consolePane.css("height").replace(/px$/, ""), 10
    );
    var controlHeight = window.parseInt(
      this.controlPane.css("height").replace(/px$/, ""), 10
    );
    var contentHeight = windowHeight - consoleHeight - controlHeight;

    this.contentPane.css("height", contentHeight);
  };

  RubyScope.Layout.prototype.clear = function(){
    this.panes.empty();
  };

})(window, jQuery, RubyScope);
