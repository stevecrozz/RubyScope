(function($, DebuggerUi){

  DebuggerUi.BreakpointView = function(ui, parent){
    this.ui = ui;
    this.root = $("<div class=\"breakpoints\"><h2>Breakpoints</h2><ol></ol></div>");
    this.list = this.root.find("ol");
    parent.append(this.root);
  };

  DebuggerUi.BreakpointView.prototype.render = function(breakpoints){
    var lis = $();
    $.each(breakpoints, function(){
      lis.after(
        $("<li>", { text: this.filename + ":" + this.line }).
          data("index", this.index));
    });
    this.list.html(lis);
  };

})(jQuery, DebuggerUi);
