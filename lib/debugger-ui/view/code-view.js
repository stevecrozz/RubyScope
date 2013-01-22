/*global DebuggerUi:false*/
/*global CodeMirror:false*/
/**
 * @module DebuggerUi
 * @namespace DebuggerUi.View
 */
(function($, DebuggerUi, CodeMirror){

  /**
   * View for displaying code for inspection
   *
   * CodeView also provides a method for requesting and clearing breakpoints
   * via clickable icons near the line markers.
   *
   * @class CodeView
   * @constructor
   * @param {DebuggerUi} ui DebuggerUi instance
   * @param {Object} parent jQuery wrapped set container
   * @param {String} languageMode Mode passed to CodeMirror for syntax
   *   highlighting (ie ruby, python, etc)
   */
  DebuggerUi.View.CodeView = function(ui, parent, languageMode){
    var view = this;

    this.ui = ui;
    this.editor = undefined;
    this.lastLine = undefined;
    this.container = parent;
    this.languageMode = languageMode;

    this.getGutterClickHandler.bind(this);

    // When a file is selected from another view, that view sends a
    // fileSelect.dui event and this view must refresh with the selected file
    // already available in its dataPoints map
    $(this.ui).bind("fileSelect.dui", function(e, file){
      view.ui.refreshView(view, { openFile: file });
    });
  };

  DebuggerUi.View.CodeView.prototype.dataRequirements = [
    "fileContents",
    "breakpoints",
    "currentFile",
    "currentLine",
    "openFile"
  ];

  /**
   * Visual indication of a breakpoint
   *
   * @property breakpointMarker
   * @type {String}
   */
  DebuggerUi.View.CodeView.prototype.
    breakpointMarker = "<span style=\"color: #900\">●</span>";

  /**
   * Instantiate the CodeMirror instance
   *
   * @method getEditor
   * @return {Object} the CodeMirror instance
   */
  DebuggerUi.View.CodeView.prototype.getEditor = function(){
    var container = arguments[0];
    var content = arguments[1];
    var openFile = arguments[2];

    return new CodeMirror(container, {
      value: content,
      mode: this.languageMode,
      lineNumbers: true,
      readOnly: "nocursor",
      onGutterClick: this.getGutterClickHandler(openFile)
    });
  };

  /**
   * Render the view, instantiating a CodeMirror object into the content pane.
   *
   * @method render
   * @param {String} content Content to render inside the CodeMirror instance
   * @param {Array} breakpoints List of breakpoint objects
   * @param {String} currentFile Current file stopped in the debugger
   * @param {String} currentLine Current line stopped in the debugger
   * @param {String} openFile If different from the currentFile, the currently
   *   open file in this view
   */
  DebuggerUi.View.CodeView.prototype.render = function(){
    var content = arguments[0];
    var breakpoints = arguments[1] || [];
    var currentFile = arguments[2];
    var currentLine = arguments[3];
    var openFile = arguments[4] || currentFile;
    var container = this.container.empty().get(0);

    this.editor = this.getEditor(container, content, openFile);

    var codeView = this;
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
   * Get a function suitable for handling the breakpoint toggle area (gutter).
   *
   * @method getGutterClickHandler
   * @param {String} openFile currently open file name
   * @return {Function}
   */
  DebuggerUi.View.CodeView.prototype.getGutterClickHandler = function(openFile){
    var codeView = this;
    var ui = this.ui;

    return function(cm, n){
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
    };
  };

  /**
   * Visually highlight the active line and scroll it into view
   *
   * @method setActiveLine
   * @param {Number} currentLine line number to set active
   */
  DebuggerUi.View.CodeView.prototype.setActiveLine = function(currentLine){
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

})(jQuery, DebuggerUi, CodeMirror);
