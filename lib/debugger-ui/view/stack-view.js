/*global DebuggerUi:false*/
(function($, DebuggerUi){

  DebuggerUi.View.StackView = function(ui, parent){
    this.ui = ui;
    this.root = $("<div class=\"stack\"><h2>Stack</h2><dl></dl></div>");
    this.list = this.root.find("dl");
    this.selectFrame = this.selectFrame.bind(this);
    this.render = this.render.bind(this);
    parent.append(this.root);

    this.list.on("click", this.selectFrame);
  };

  DebuggerUi.View.StackView.prototype.dataRequirements = [
    "stack"
  ];

  DebuggerUi.View.StackView.prototype.selectFrame = function(e){
    var frameId = $(e.target).data("frame");
    this.ui.requestHandlers.switchFrame(frameId);
    this.ui.refresh();
  };

  DebuggerUi.View.StackView.prototype.render = function(stack){
    var contents = $();

    $.each(stack, function(index){
      var dt = $("<dt>").text(this.context);
      var dd = $("<dd>").text(this.filename + ":" + this.line);
      dt.data("frame", index).data("filename", this.filename);
      dd.data("frame", index).data("filename", this.filename);

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
