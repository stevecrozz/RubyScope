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

    var ui = new DebuggerUi();

    /**
     * Connection form submission. Start the debugger.
     */
    $("form.connect").on("submit", function(){
      $(this).serializeArray();
      var host = $(this).find("input[name=host]").val();
      var port = parseInt($(this).find("input[name=port]").val(), 10);

      ui.debuggerClient = new RubyDebugClient(host, port, {
        connect: function(){
          connectionDialog.dialog("close");
          $(".connected").show();
          ui.refresh();
        },
        disconnect: function(){
          connectionDialog.dialog("open");
        }
      });

      ui.debuggerClient.connect();

      return false;
    });

    $(".control a.continue").button({
      icons: { primary: "ui-icon-play" },
      label: "Continue",
      text: false
    }).on("click", function(){
      ui.debuggerClient.controlFlow("continue");
      ui.refresh();
    });

    $(".control a.step").button({
      icons: { primary: "ui-icon-arrowreturnthick-1-s" },
      label: "Step",
      text: false
    }).on("click", function(){
      ui.debuggerClient.controlFlow("step");
      ui.refresh();
    });

    $(".control a.next").button({
      icons: { primary: "ui-icon-seek-next" },
      label: "Next",
      text: false
    }).on("click", function(){
      ui.debuggerClient.controlFlow("next");
      ui.refresh();
    });

    $(".control a.up").button({
      icons: { primary: "ui-icon-arrowthick-1-n" },
      label: "Up",
      text: false
    }).on("click", function(){
      ui.debuggerClient.controlFlow("up");
      ui.refresh();
    });

    $(".control a.down").button({
      icons: { primary: "ui-icon-arrowthick-1-s" },
      label: "Down",
      text: false
    }).on("click", function(){
      ui.debuggerClient.controlFlow("down");
      ui.refresh();
    });

    $(".control .reconnect").button().on("click", function(){
      ui.debuggerClient.disconnect();
      connectionDialog.dialog("open");
    });

    $(".operations").buttonset();

    /**
     * Monitor resize events and trigger one immediately
     */
    $(window).on("resize", function(){
      ui.resize();
      connectionDialog.dialog("option", "position", "center");
    }).trigger("resize");

  });

})(jQuery);
