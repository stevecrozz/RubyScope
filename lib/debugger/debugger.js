(function($){

  /**
   * DebuggerUI is a generic front-end for a debugger interface
   */
  var DebuggerUi = function(){
    this.lastFile = null;
    this.lastLine = null;
    this.editor = null;
    this.commandPrompt = null;
    this.debuggerClient = null;
  };

  /**
   * Handle window resizes making sure each panel has the right proportions
   */
  DebuggerUi.prototype.resize = function(){
    var windowHeight = window.innerHeight;
    var consoleHeight = window.parseInt(
      $(".pane.console").css("height").replace(/px$/, ""), 10
    );
    var controlHeight = window.parseInt(
      $(".pane.control").css("height").replace(/px$/, ""), 10
    );

    $(".pane.content").css("height", windowHeight - consoleHeight - controlHeight);
  };

  /**
   * populate the stack, and highlight the current line
   */
  DebuggerUi.prototype.where = function(stack){
    var rdc = this.debuggerClient;
    var dl = $(".stack dl").empty();
    $.each(stack, function(index){
      var dt = $("<dt>").text(this.context).data("frame", index);
      var dd = $("<dd>").text(this.filename + ":" + this.line).data("frame", index);

      if (this.current) {
        dt.addClass("current");
        dd.addClass("current");
      }

      dl.append(dt).append(dd);
    });

    if (!this.commandPrompt) {
      this.initConsole();
    }

    if (this.file !== this.lastFile) {
      rdc.list(function(content){
        this.openFile = this.lastFile;
        this.setCode(content);
        this.setActiveLine();
      }.bind(this));
    } else {
      this.setActiveLine();
    }

    // keep track of which file we last had open
    this.lastFile = rdc.file;
    this.lastLine = rdc.line;
  };

  /**
   * Open the console
   */
  DebuggerUi.prototype.initConsole = function(){

    this.commandPrompt = new CommandPrompt($(".console"));

    var rdc = this.debuggerClient;
    var cp = this.commandPrompt;

    // Handle commands by sending them to this.evaluate and When we get a
    // response from an evaluate instruction, the commandPrompt should handle
    // it.
    this.commandPrompt.handleCommand = function(command){
      rdc.evaluate.call(rdc, command, $.proxy(cp.handleResponse, cp));
    };
  };

  /**
   * Visually highlight the active line and scroll it into view
   */
  DebuggerUi.prototype.setActiveLine = function(){
    if (this.editor) {
      var line = this.debuggerClient.line - 1;
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

  /**
   * Fill the content pane with code.
   */
  DebuggerUi.prototype.setCode = function(content){
    var ui = this;

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
          ui.debuggerClient.clearBreakpoint(ui.openFile, n + 1);
          cm.clearMarker(n);
        } else {
          ui.debuggerClient.requestBreakpoint(ui.openFile, n + 1, function(){
            cm.setMarker(n, "<span style=\"color: #900\">●</span>");
            ui.debuggerClient.listBreakpoints();
          });
        }
      }
    });
  };

  /**
   * Callback received when listing files
   */
  DebuggerUi.prototype.files = function(files){
    var fileList = $(".status .files").find("ul");
    var currentFile = this.debuggerClient.file;
    var lis = $();

    $.each(files, function(){
      if (this.toString() === currentFile) {
        lis.after($("<li>", { text: this }).addClass("current"));
      } else {
        lis.after($("<li>", { text: this }));
      }
    });

    fileList.html(lis);
  };

  /**
   * Refresh the whole UI
   */
  DebuggerUi.prototype.refresh = function(){
    this.debuggerClient.where($.proxy(this.where, this));
    this.debuggerClient.files($.proxy(this.files, this));
  };

  /**
   * DOM is ready, begin watching for events.
   */
  $(function(){

    var ui = new DebuggerUi();

    /**
     * Connection form submission. Start the debugger.
     */
    $("form.connect").on("submit", function(){
      $(this).serializeArray();
      var host = $(this).find("input[name=host]").val();
      var port = parseInt($(this).find("input[name=port]").val(), 10);

      ui.debuggerClient = new RubyDebugClient(host, port);

      ui.debuggerClient.connect(function(){
        $(".disconnected").hide();
        $(".connected").show();

        ui.refresh();
      });

      return false;
    });

    $(".operations a.continue").click(function(){
      ui.debuggerClient.controlFlow("continue");
      ui.refresh();
    });

    $(".operations a.step").click(function(){
      ui.debuggerClient.controlFlow("step");
      ui.refresh();
    });

    $(".operations a.next").click(function(){
      ui.debuggerClient.controlFlow("next");
      ui.refresh();
    });

    $(".operations a.up").click(function(){
      ui.debuggerClient.controlFlow("up");
      ui.refresh();
    });

    $(".operations a.down").click(function(){
      ui.debuggerClient.controlFlow("down");
      ui.refresh();
    });

    $(".stack dl").on("click", function(event){
      var frameId = $(event.target).data("frame");
      ui.debuggerClient.frame(frameId);
      ui.refresh();
    });

    // handle click on a file
    $(".files ul").on("click", "li", function(event){
      ui.openFile = $(this).text();
      ui.debuggerClient.readFile($(this).text(), ui.setCode);
      $(".files").find(".current").removeClass("current");
      $(this).addClass("current");
    });

    /**
     * Monitor resize events and trigger one immediately
     */
    $(window).on("resize", ui.resize).trigger("resize");

  });

})(jQuery);
