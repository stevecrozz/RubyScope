/*global DebuggerUi:false*/
(function($, DebuggerUi){

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

    /**
     * Connection form submission. Start the debugger.
     */
    $("form.connect").on("submit", function(){

      var detailsPane = $("<section class=\"pane details\">");
      var controlPane = $("<section class=\"pane control\">");
      var contentPane = $("<section class=\"pane content\">");
      var consolePane = $("<section class=\"pane console\">");

      $(".debugger").
        append(detailsPane).
        append(controlPane).
        append(contentPane).
        append(consolePane);

      $(this).serializeArray();
      var host = $(this).find("input[name=host]").val();
      var port = parseInt($(this).find("input[name=port]").val(), 10);

      var rdc = new RubyDebugClient(host, port, {
        connect: function(){
          connectionDialog.dialog("close");
          $(".connected").show();
          ui.refresh();
        },
        disconnect: function(){
          connectionDialog.dialog("open");
        }
      });

      var ui = new DebuggerUi({
        adapter: DebuggerUi.Adapter.RubyDebugClientAdapter(rdc)
      });

      new DebuggerUi.StackView(ui, detailsPane);
      new DebuggerUi.BreakpointView(ui, detailsPane);
      new DebuggerUi.ThreadView(ui, detailsPane);
      new DebuggerUi.FileView(ui, detailsPane);
      new DebuggerUi.ConsoleView(ui, consolePane);
      new DebuggerUi.CodeView(ui, contentPane);
      new DebuggerUi.ControlView(ui, controlPane, [
        { label: "Continue", action: "cont" },
        { label: "Next", action: "next" },
        { label: "Step", action: "step" },
        { label: "Up", action: "up" },
        { label: "Down", action: "down" }
      ]);

      /**
       * Monitor resize events and trigger one immediately
       */
      $(window).on("resize", function(){
        ui.resize();
        connectionDialog.dialog("option", "position", "center");
      }).trigger("resize");

      /**
       * Add a reconnect button
       */
      $("<span class=\"status\">").append(
        $("<a href=\"#\">Reconnect</a>").button().on("click", function(){
          rdc.disconnect();
          connectionDialog.dialog("open");
        })
      ).appendTo(controlPane);

      rdc.connect();

      return false;
    });

  });

})(jQuery, DebuggerUi);
