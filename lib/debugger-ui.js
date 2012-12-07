(function(exports, $){

  /**
   * DebuggerUI is a generic front-end for a debugger interface
   */
  var DebuggerUi = function(){
    this.lastFile = null;
    this.lastLine = null;
    this.commandPrompt = null;
    this.debuggerClient = null;

    var detailsPane = $(".pane.details");
    var contentPane = $(".pane.content");

    this.stackView = new DebuggerUi.StackView(this, detailsPane);
    this.breakpointView = new DebuggerUi.BreakpointView(this, detailsPane);
    this.threadView = new DebuggerUi.ThreadView(this, detailsPane);
    this.fileView = new DebuggerUi.FileView(this, detailsPane);
    this.codeView = new DebuggerUi.CodeView(this, contentPane);
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
   * Callback received when listing files
   *
   * @param {Array} files array of file names
   */
  DebuggerUi.prototype.files = function(files){
    this.fileView.render(files, this.debuggerClient.file);
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
      rdc.evaluate.call(rdc, command, cp.handleResponse.bind(cp));
    };
  };

  /**
   * Visual indication of a breakpoint
   */
  DebuggerUi.prototype.breakpointMarker = "<span style=\"color: #900\">●</span>";

  /**
   * Update break points
   */
  DebuggerUi.prototype.updateBreakpoints = function(){
    var ui = this;

    this.debuggerClient.listBreakpoints(function(breakpoints){
      ui.breakpointView.render(breakpoints);
    });
  };

  DebuggerUi.prototype.threads = function(threads){
    this.threadView.render(threads);
  };

  DebuggerUi.prototype.readFile = function(file){
    var ui = this;

    this.debuggerClient.readFile(file, function(response){
      ui.lastFile = file;
      ui.codeView.render(response);
    }.bind(ui));
  };

  /**
   * Refresh the whole UI
   */
  DebuggerUi.prototype.refresh = function(){
    this.debuggerClient.where(this.stackView.render);
    this.debuggerClient.files(this.files.bind(this));
    this.debuggerClient.threads(this.threads.bind(this));

    if (!this.commandPrompt) {
      this.initConsole();
    }

    if (this.openFile !== this.lastFile) {
      this.debuggerClient.list(function(content){
        this.codeView.render(content);
        this.codeView.setActiveLine();
      }.bind(this));
    } else {
      this.codeView.setActiveLine();
    }

    // keep track of which file we last had open
    this.lastFile = this.debuggerClient.file;
    this.lastLine = this.debuggerClient.line;
  };

  /**
   * export the interface
   */
  window.DebuggerUi = DebuggerUi;

})(window, jQuery);
