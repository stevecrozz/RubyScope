(function($){

  /**
   * DOM is ready, begin watching for events.
   */
  $(function(){

    var connectionForm = $(".disconnected form");

    var connectionDialog = $(".disconnected").dialog({
      modal: true,
      resizable: false,
      title: "Connection Parameters",
      closeOnEscape: false,
      dialogClass: "connection-parameters",
      buttons: [{
        text: "Connect",
        click: function(){
          connectionForm.submit();
        }
      }]
    });

    var detailsPane = $(".pane.details");
    var contentPane = $(".pane.content");
    var consolePane = $(".pane.console");

    /**
     * Connection form submission. Start the debugger.
     */
    $("form.connect").on("submit", function(){

      $(this).serializeArray();
      var host = $(this).find("input[name=host]").val();
      var port = parseInt($(this).find("input[name=port]").val(), 10);

      var rubyDebugClient = new RubyDebugClient(host, port, {
        connect: function(){
          connectionDialog.dialog("close");
          $(".connected").show();
          ui.refresh();
        },
        disconnect: function(){
          connectionDialog.dialog("open");
        }
      });

      rubyDebugClient.connect();

      var ui = new DebuggerUi({
        requestHandlers: {
          switchThread: rubyDebugClient.switchThread.bind(rubyDebugClient),
          switchFrame: rubyDebugClient.frame.bind(rubyDebugClient),
          requestBreakpoint: rubyDebugClient.requestBreakpoint.bind(rubyDebugClient),
          clearBreakpoint: rubyDebugClient.clearBreakpoint.bind(rubyDebugClient),
          evaluate: rubyDebugClient.evaluate.bind(rubyDebugClient)
        },
        dataProviders: {
          stack: function(dataPoints, deferred){
            rubyDebugClient.where(function(stack){
              var currentFrame = $.grep(stack, function(e){
                return e.current;
              })[0];

              dataPoints.currentFile = currentFrame.filename;
              dataPoints.currentLine = currentFrame.line;

              dataPoints.stack = stack;
              deferred.resolve();
            });
          },
          breakpoints: function(dataPoints, deferred){
            rubyDebugClient.listBreakpoints(function(breakpoints){
              dataPoints.breakpoints = breakpoints;
              deferred.resolve();
            });
          },
          threads: function(dataPoints, deferred){
            rubyDebugClient.threads(function(threads){
              dataPoints.threads = threads;
              deferred.resolve();
            });
          },
          files: function(dataPoints, deferred){
            rubyDebugClient.files(function(files){
              dataPoints.files = files;
              deferred.resolve();
            });
          },
          fileContents: function(dataPoints, deferred){
            var resolver = function(code){
              dataPoints.fileContents = code;
              deferred.resolve();
            }

            if (typeof dataPoints.openFile === "undefined") {
              rubyDebugClient.list(resolver);
            } else {
              rubyDebugClient.readFile(dataPoints.openFile, resolver);
            }
          },
          openFile: function(dataPoints, deferred){
            deferred.resolve();
          }
        },
        dataProviderMap: {
          stack: "stack",
          currentFile: "stack",
          currentLine: "stack",
          breakpoints: "breakpoints",
          threads: "threads",
          files: "files",
          fileContents: "fileContents",
          openFile: "openFile"
        },
        panes: [
          {
            el: detailsPane,
            views: [
              DebuggerUi.StackView,
              DebuggerUi.BreakpointView,
              DebuggerUi.ThreadView,
              DebuggerUi.FileView
            ]
          },
          {
            el: contentPane,
            views: [
              DebuggerUi.CodeView
            ]
          },
          {
            el: consolePane,
            views: [
              DebuggerUi.ConsoleView
            ]
          }
        ]
      });


      /**
       * Monitor resize events and trigger one immediately
       */
      $(window).on("resize", function(){
        ui.resize();
        connectionDialog.dialog("option", "position", "center");
      }).trigger("resize");

      return false;
    });

    //$(".control a.continue").button({
      //icons: { primary: "ui-icon-play" },
      //label: "Continue",
      //text: false
    //}).on("click", function(){
      //ui.debuggerClient.controlFlow("continue");
      //ui.refresh();
    //});

    //$(".control a.step").button({
      //icons: { primary: "ui-icon-arrowreturnthick-1-s" },
      //label: "Step",
      //text: false
    //}).on("click", function(){
      //ui.debuggerClient.controlFlow("step");
      //ui.refresh();
    //});

    //$(".control a.next").button({
      //icons: { primary: "ui-icon-seek-next" },
      //label: "Next",
      //text: false
    //}).on("click", function(){
      //ui.debuggerClient.controlFlow("next");
      //ui.refresh();
    //});

    //$(".control a.up").button({
      //icons: { primary: "ui-icon-arrowthick-1-n" },
      //label: "Up",
      //text: false
    //}).on("click", function(){
      //ui.debuggerClient.controlFlow("up");
      //ui.refresh();
    //});

    //$(".control a.down").button({
      //icons: { primary: "ui-icon-arrowthick-1-s" },
      //label: "Down",
      //text: false
    //}).on("click", function(){
      //ui.debuggerClient.controlFlow("down");
      //ui.refresh();
    //});

    //$(".control .reconnect").button().on("click", function(){
      //ui.debuggerClient.disconnect();
      //connectionDialog.dialog("open");
    //});

    //$(".operations").buttonset();

  });

})(jQuery);
