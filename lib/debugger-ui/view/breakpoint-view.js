/*global DebuggerUi:false*/
(function($, DebuggerUi){

  DebuggerUi.View.BreakpointView = function(ui, parent){
    var view = this;

    this.ui = ui;
    this.root = $("<div class=\"breakpoints\"><h2>Breakpoints</h2><ol></ol></div>");
    this.list = this.root.find("ol");
    parent.append(this.root);

    // refresh when a breakpoint is added
    $(ui).bind("breakpointAdd.dui", function(){
      ui.refreshView(view);
    });

    // refresh when a breakpoint is removed
    $(ui).bind("breakpointRemove.dui", function(){
      ui.refreshView(view);
    });
  };

  DebuggerUi.View.BreakpointView.prototype.dataRequirements = [
    "breakpoints"
  ];

  DebuggerUi.View.BreakpointView.prototype.render = function(breakpoints){
    var lis = $();
    $.each(breakpoints, function(){
      lis.after(
        $("<li>", { text: this.filename + ":" + this.line }).
          data("index", this.index));
    });
    this.list.html(lis);
  };

})(jQuery, DebuggerUi);
