/*global jQuery:false */
/*global DebuggerUi:false*/
/**
 * Exports the FileView namespace
 *
 * @module DebuggerUi
 * @namespace DebuggerUi.View
 */
(function($, DebuggerUi){

  /**
   * FileView provides an interactive file listing given a list of files to
   * render. When a file is selected, FileView sends a jQuery 'fileSelect.dui'
   * event to the ui object provided here in case any other view is interested
   * in observing that event.
   *
   * @class FileView
   * @constructor
   * @param {DebuggerUi} ui
   * @param {Object} parent jQuery wrapped set
   */
  DebuggerUi.View.FileView = function(ui, parent){
    this.ui = ui;
    this.root = $("<div class=\"files\"><h2>Files</h2><ul></ul></div>");
    this.list = this.root.find("ul");
    this.selectFile = this.selectFile.bind(this);
    parent.append(this.root);

    this.list.on("click", "li", this.selectFile);
  };

  /**
   * FileView requires a file list and the currently open file from the back
   * end.
   *
   * @property dataRequirements
   * @type Array
   */
  DebuggerUi.View.FileView.prototype.dataRequirements = [
    "files",
    "currentFile"
  ];

  /**
   * selectFile is triggered when a file is selected.
   *
   * @method selectFile
   * @param {jQuery.Event} e
   */
  DebuggerUi.View.FileView.prototype.selectFile = function(e){
    var target = $(e.target);

    // trigger a fileSelect event in case anyone cares
    $(this.ui).trigger("fileSelect.dui", target.text());

    $(".files").find(".current").removeClass("current");
    target.addClass("current");
  };

  /**
   * Refresh the view with the given list of files. Apply the 'current' class
   * to the DOM element containing the file specified as currentFile.
   *
   * The given list of files must be an array of arrays, the inner array being
   * a list of names for a single file.
   *
   * @method render
   * @param {Array} files list of files to render
   * @param {String} currentFile optional file to mark as current
   */
  DebuggerUi.View.FileView.prototype.render = function(files, currentFile){
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
