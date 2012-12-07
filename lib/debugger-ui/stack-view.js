(function($, DebuggerUi){

  DebuggerUi.StackView = function(ui, parent){
    this.ui = ui;
    this.root = $("<div class=\"stack\"><h2>Stack</h2><dl></dl></div>");
    this.list = this.root.find("dl");
    this.selectFrame = this.selectFrame.bind(this);
    this.render = this.render.bind(this);
    parent.append(this.root);

    this.list.on("click", this.selectFrame);
  };

  DebuggerUi.StackView.prototype.selectFrame = function(e){
    var frameId = $(e.target).data("frame");
    this.ui.debuggerClient.frame(frameId);
    this.ui.refresh();
  };

  DebuggerUi.StackView.prototype.render = function(stack){
    var contents = $();

    // save a reference to the currently open file
    this.ui.openFile = $.grep(stack, function(e){
      return e.current;
    })[0].filename;

    $.each(stack, function(index){
      var dt = $("<dt>").text(this.context).data("frame", index);
      var dd = $("<dd>").text(this.filename + ":" + this.line).data("frame", index);

      if (this.current) {
        dt.addClass("current");
        dd.addClass("current");
      }

      contents.after(dt);
      contents.after(dd);
    });

    this.list.html(contents);
  };

})(jQuery, DebuggerUi);
