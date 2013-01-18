/*global DebuggerUi:false*/
(function($, DebuggerUi){

  DebuggerUi.View.ThreadView = function(ui, parent){
    this.ui = ui;
    this.root = $("<div class=\"threads\"><h2>Threads</h2><ol></ol></div>");
    this.list = this.root.find("ol");
    this.selectThread = this.selectThread.bind(this);
    parent.append(this.root);

    this.list.on("click", "li", this.selectThread);
  };

  DebuggerUi.View.ThreadView.prototype.dataRequirements = [
    "threads"
  ];

  DebuggerUi.View.ThreadView.prototype.selectThread = function(e){
    this.ui.requestHandlers.switchThread($(e.target).data("thread_id"));
    this.ui.refresh();
  };

  DebuggerUi.View.ThreadView.prototype.render = function(threads){
    var lis = $();

    $.each(threads, function(){
      var t = $("<li>").data("thread_id", this.id).text(this.text);
      if (this.current) {
        t.addClass("current");
      }
      lis.after(t);
    });

    this.list.html(lis);
  };

})(jQuery, DebuggerUi);
