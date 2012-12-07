(function($, DebuggerUi){

  DebuggerUi.CodeView = function(ui, parent){
    this.ui = ui;
    this.root = $("<div class=\"file-contents\">");
    this.editor = undefined;
    parent.html(this.root);
  };

  DebuggerUi.CodeView.prototype.render = function(content){
    var codeView = this;
    var ui = this.ui;

    // populate the list
    var section = $(".pane.content").empty();

    this.editor = new CodeMirror(section.get(0), {
      value: content,
      mode: "ruby",
      lineNumbers: true,
      readOnly: "nocursor",
      onGutterClick: function(cm, n) {
        var info = cm.lineInfo(n);
        if (info.markerText) {
          ui.debuggerClient.clearBreakpoint(ui.openFile, n + 1, function(){
            cm.clearMarker(n);
            ui.updateBreakpoints();
          });
        } else {
          ui.debuggerClient.requestBreakpoint(ui.openFile, n + 1, function(){
            cm.setMarker(n, ui.breakpointMarker);
            ui.updateBreakpoints();
          });
        }
      }
    });

    $.each(ui.debuggerClient.breakpoints, function(){
      if (ui.openFile === this.filename) {
        codeView.editor.setMarker(this.line - 1, ui.breakpointMarker);
      }
    });
  };

  /**
   * Visually highlight the active line and scroll it into view
   */
  DebuggerUi.CodeView.prototype.setActiveLine = function(){
    if (this.editor) {
      var line = this.ui.debuggerClient.line - 1;
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
    }
  };

})(jQuery, DebuggerUi);
