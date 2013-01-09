/*global DebuggerUi:false*/
(function($, DebuggerUi){

  DebuggerUi.ControlView = function(ui, parent, controls){
    if (typeof ui.requestHandlers === "undefined") {
      throw new Error("no request handlers found");
    }

    var operations = $("<span class=\"operations\">");

    var i;
    for (i = 0; i<controls.length; i++) {
      var action = controls[i].action;
      var label = controls[i].label;
      var handler = ui.requestHandlers[action];

      if (typeof handler === "undefined") {
        throw new Error("missing request handler for '" + action + "')");
      }

      $("<a href=\"#\">").
        appendTo(operations).
        button({
          icons: { primary: this.icons[action] },
          label: label,
          text: false
        }).click(handler);
    }

    operations.buttonset();
    parent.append(operations);
  };

  DebuggerUi.ControlView.prototype.icons = {
    cont: "ui-icon-play",
    step: "ui-icon-arrowreturnthick-1-s",
    next: "ui-icon-seek-next",
    up: "ui-icon-arrowthick-1-n",
    down: "ui-icon-arrowthick-1-s"
  };

  DebuggerUi.ControlView.prototype.render = function(){};

})(jQuery, DebuggerUi);
