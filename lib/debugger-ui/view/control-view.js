/*global DebuggerUi:false*/
/**
 * Exports the ControlView class
 *
 * @module DebuggerUi
 * @namespace DebuggerUi.View
 */
(function($, DebuggerUi){

  /**
   * ControlView provides an interface mainly for sending one-way messages to
   * the back end. For each control object specified in the controls parameter,
   * ControlView will draw a button with the specified label. If there is a
   * matching entry in the icons hash for an action, ControlView will attempt
   * to use the value it finds as the jQuery UI primary button class. See
   * <a href="http://api.jqueryui.com/button/">
   *   http://api.jqueryui.com/button/
   * </a> for more information.
   *
   * When a button from this view is selected, ControlView will call an event
   * handler defined in the adapter with the same name.
   *
   * @class ControlView
   * @constructor
   * @param {DebuggerUi} ui DebuggerUi instance
   * @param {Object} parent jQuery wrapped set container
   * @param {Array} controls array of control objects
   * @example
   *     DebuggerUi.View.ControlView(
   *       debuggerUi,
   *       jQuery("#myContainer"),
   *       [
   *         { action: "next", label: "Next" },
   *         { action: "cont", label: "Continue" }
   *       ]
   *     );
   */
  DebuggerUi.View.ControlView = function(ui, parent, controls){
    if (typeof ui.requestHandlers === "undefined") {
      throw new Error("no request handlers found");
    }

    controls = controls || [];

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

  /**
   * Hash of icon names keyed action name. The icon names and actual icons are
   * provided by jQueryUI.
   *
   * @property icons
   * @type Object
   */
  DebuggerUi.View.ControlView.prototype.icons = {
    cont: "ui-icon-play",
    step: "ui-icon-arrowreturnthick-1-s",
    next: "ui-icon-seek-next",
    up: "ui-icon-arrowthick-1-n",
    down: "ui-icon-arrowthick-1-s"
  };

  /**
   * In this view there isn't anything to do, but ControlView respects the
   * interface and provides an empty function.
   *
   * @method render
   */
  DebuggerUi.View.ControlView.prototype.render = function(){};

})(jQuery, DebuggerUi);
