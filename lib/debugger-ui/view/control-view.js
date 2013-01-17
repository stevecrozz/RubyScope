/*global DebuggerUi:false*/
(function($, DebuggerUi){

  DebuggerUi.View.ControlView = function(ui, parent, controls){
    if (typeof ui.requestHandlers === "undefined") {
      throw new Error("no request handlers found");
    }

    var operations = $("<span class=\"operations\">");
    var icons = this.icons;

    $.each(controls, function(){
      var action = this.action;
      var label = this.label;
      var handler = ui.requestHandlers[action];

      if (typeof handler === "undefined") {
        throw new Error("missing request handler for '" + action + "')");
      }

      $("<a href=\"#\">").
        appendTo(operations).
        button({
          icons: { primary: icons[action] },
          label: label,
          text: false
        }).click(function(){
          handler();
          ui.refresh();
        });
    });

    operations.buttonset();
    parent.append(operations);
  };

  DebuggerUi.View.ControlView.prototype.icons = {
    cont: "ui-icon-play",
    step: "ui-icon-arrowreturnthick-1-s",
    next: "ui-icon-seek-next",
    up: "ui-icon-arrowthick-1-n",
    down: "ui-icon-arrowthick-1-s"
  };

  DebuggerUi.View.ControlView.prototype.render = function(){};

})(jQuery, DebuggerUi);
