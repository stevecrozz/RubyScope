/*global DebuggerUi:false*/
(function($, DebuggerUi){

  // DOM is ready, begin watching for events.
  $(function(){

    var connectionForm = $(".disconnected form");

    var connectionError = $(".disconnected .error");

    var clearError = function(){
      connectionError.empty().hide();
    };

    var setError = function(e){
      connectionError.html(e).show();
    };

    var d = $(".debugger");
    var detailsPane = $("<section class=\"pane details\">").appendTo(d);
    var controlPane = $("<section class=\"pane control\">").appendTo(d);
    var contentPane = $("<section class=\"pane content\">").appendTo(d);
    var consolePane = $("<section class=\"pane console\">").appendTo(d);
    var panes = d.find(".pane");

    var connectionDialog = $(".disconnected").dialog({
      modal: true,
      resizable: false,
      title: "Connection Parameters",
      closeOnEscape: false,
      dialogClass: "connection-parameters",
      position: "center",
      buttons: [{
        text: "Connect",
        click: function(){
          connectionForm.submit();
        }
      }]
    });

    // Monitor resize events and trigger one immediately
    $(window).on("resize", function(){
      var windowHeight = window.innerHeight;
      var consoleHeight = window.parseInt(
        consolePane.css("height").replace(/px$/, ""), 10
      );
      var controlHeight = window.parseInt(
        controlPane.css("height").replace(/px$/, ""), 10
      );
      contentPane.css("height", windowHeight - consoleHeight - controlHeight);
      connectionDialog.dialog("option", "position", "center");
    }).trigger("resize");

    // Connection form submission. Start the debugger.
    $("form.connect").on("submit", function(){
      panes.empty();
      clearError();

      var submitButton = $(this).closest(".ui-dialog").find("button");
      submitButton.button("disable");

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
          submitButton.button("enable");
        },
        timeout: function(){
          submitButton.button("enable");
          setError("Connection timed out.");
        }
      });

      var ui = new DebuggerUi({
        adapter: DebuggerUi.Adapter.RubyDebugClientAdapter(rdc),
        views: [
          {
            view: DebuggerUi.View.StackView,
            parameters: [ detailsPane ]
          },
          {
            view: DebuggerUi.View.BreakpointView,
            parameters: [ detailsPane ]
          },
          {
            view: DebuggerUi.View.ThreadView,
            parameters: [ detailsPane ]
          },
          {
            view: DebuggerUi.View.FileView,
            parameters: [ detailsPane ]
          },
          {
            view: DebuggerUi.View.ConsoleView,
            parameters: [ consolePane ]
          },
          {
            view: DebuggerUi.View.CodeView,
            parameters: [ contentPane, "ruby" ]
          },
          {
            view: DebuggerUi.View.ControlView,
            parameters: [ controlPane, [
              { label: "Continue", action: "cont" },
              { label: "Next", action: "next" },
              { label: "Step", action: "step" },
              { label: "Up", action: "up" },
              { label: "Down", action: "down" }
            ]]
          }
        ]
      });

      // Add a reconnect button
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
