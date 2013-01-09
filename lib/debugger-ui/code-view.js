/*global DebuggerUi:false*/
(function($, DebuggerUi){

  DebuggerUi.CodeView = function(ui, parent){
    ui.registerView(this);

    var view = this;

    this.ui = ui;
    this.root = $("<div class=\"file-contents\">");
    this.editor = undefined;
    this.lastLine = undefined;
    parent.html(this.root);

    $(this.ui).bind("fileSelect.dui", function(e, file){
      view.ui.refreshView(view, {
        openFile: file
      });
    });
  };

  DebuggerUi.CodeView.prototype.dataRequirements = [
    "fileContents",
    "breakpoints",
    "currentFile",
    "currentLine",
    "openFile"
  ];

  /**
   * Visual indication of a breakpoint
   */
  DebuggerUi.CodeView.prototype.breakpointMarker = "<span style=\"color: #900\">●</span>";


  DebuggerUi.CodeView.prototype.render = function(content, breakpoints, currentFile, currentLine, openFile){
    var codeView = this;
    var ui = this.ui;

    openFile = openFile || currentFile;

    // populate the list
    var section = $(".pane.content").empty();

    this.editor = new CodeMirror(section.get(0), {
      value: content,
      mode: "ruby",
      lineNumbers: true,
      readOnly: "nocursor",
      onGutterClick: function(cm, n){
        var info = cm.lineInfo(n);
        var line = n + 1;
        if (info.markerText) {
          ui.requestHandlers.clearBreakpoint(openFile, line, function(){
            cm.clearMarker(n);
            $(ui).trigger("breakpointRemove.dui", [openFile, line]);
          });
        } else {
          ui.requestHandlers.requestBreakpoint(openFile, line, function(){
            cm.setMarker(n, codeView.breakpointMarker);
            $(ui).trigger("breakpointAdd.dui", [openFile, line]);
          });
        }
      }
    });

    $.each(breakpoints, function(){
      if (openFile === this.filename) {
        codeView.editor.setMarker(this.line - 1, codeView.breakpointMarker);
      }
    });

    if (currentFile === openFile) {
      this.setActiveLine(currentLine);
    }
  };


  /**
   * Visually highlight the active line and scroll it into view
   */
  DebuggerUi.CodeView.prototype.setActiveLine = function(currentLine){
    if (this.editor) {
      var line = currentLine - 1;
      var scrollerHeight = $(this.editor.getScrollerElement()).height();
      var lineHeight = $(this.editor.getScrollerElement()).find("pre:first").height();

      // unhighlight the last line
      if (this.lastLine) {
        this.editor.setLineClass(this.lastLine - 1, null, null);
      }

      // highlight the current line
      this.editor.setLineClass(line, null, "current-line");

      // scroll it into view
      this.editor.scrollTo(0, line * lineHeight - scrollerHeight / 2);

      this.lastLine = line;
    }
  };

})(jQuery, DebuggerUi);
