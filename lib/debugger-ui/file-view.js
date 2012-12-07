(function($, DebuggerUi){

  DebuggerUi.FileView = function(ui, parent){
    this.ui = ui;
    this.root = $("<div class=\"files\"><h2>Files</h2><ul></ul></div>");
    this.list = this.root.find("ul");
    this.selectFile = this.selectFile.bind(this);
    parent.append(this.root);

    this.list.on("click", "li", this.selectFile);
  };

  DebuggerUi.FileView.prototype.selectFile = function(e){
    var ui = this.ui;
    var target = $(e.target);
    var file = target.text();

    ui.openFile = file;
    ui.readFile(file);
    $(".files").find(".current").removeClass("current");
    target.addClass("current");
  };

  DebuggerUi.FileView.prototype.render = function(files, currentFile){
    var lis = $();

    $.each(files, function(){
      var firstName = this[0];

      if (firstName === currentFile) {
        lis.after($("<li>", { text: firstName }).addClass("current"));
      } else {
        lis.after($("<li>", { text: firstName }));
      }
    });

    this.list.html(lis);
  };

})(jQuery, DebuggerUi);
