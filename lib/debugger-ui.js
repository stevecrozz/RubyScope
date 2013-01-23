/**
 * Exports the DebuggerUi class
 *
 * @module DebuggerUi
 */
(function(exports, $){

  /**
   * DebuggerUI is a generic front-end for a debugger interface. Instantiate
   * the DebuggerUi with an adapter to your back end of choice.
   *
   * @class DebuggerUi
   * @constructor
   * @see 'debugger-ui/adapter/ruby-debug-client-adapter.js' for an example
   * @param {Object} [options] configuration object
   * @param {Object} [options.adapter] adapter to the backend that provides all
   *   the interaction with the underlying data
   * @param {Array} [options.views] list of views for the UI to install
   */
  var DebuggerUi = function(options){
    this.views = [];

    if (typeof options !== "object") {
      throw "Read the documentation";
    }

    if (typeof options.adapter === "undefined") {
      throw "Adapter must be set";
    }

    this.requestHandlers = options.adapter.requestHandlers;
    this.dataProviders = options.adapter.dataProviders;
    this.dataProviderMap = options.adapter.dataProviderMap;

    if (typeof options.views === "undefined") {
      throw "What good is DebuggerUi without any views?";
    }

    this.installViews(options.views);

    // bind local functions
    this.refresh = this.refresh.bind(this);
    this.refreshView = this.refreshView.bind(this);
  };

  /**
   * The public interface for view registration. Generally views should
   * register themselves as soon as they're ready using this interface.
   *
   * @method installViews
   * @param {DebuggerUi.View} view view to register
   */
  DebuggerUi.prototype.installViews = function(viewConfs){
    var i;
    for (i=0; i<viewConfs.length; i++) {
      var viewClass = viewConfs[i].view;
      var viewArgs = viewConfs[i].parameters;
      viewArgs.unshift(this);

      this.views.push(
        DebuggerUi.View.BuildView(viewClass, viewArgs)
      );
    }
  };

  /**
   * Ask the adapter for data. Provide a dataPoints object to collect all the
   * data provided by the adapter.
   *
   * If you don't provide any deferreds, provideData will create one for each
   * dataProvider internally. If you do provide deferreds, provideData will not
   * request data from that dataProvider and will assume the data is available
   * as soon as the given deferred is resolved.
   *
   * @method provideData
   * @param {Array} dataPointNames list of named data requirements
   * @param {Object} dataPoints data collection object
   * @param {Object} deferreds keyed by data provider name
   * @return {jQuery.Deferred} resolved when data requirements are fulfilled
   */
  DebuggerUi.prototype.provideData = function(dataPointNames, dataPoints, deferreds){
    deferreds = deferreds || {};

    var localDeferreds = [];
    var i;

    for (i=0; i<dataPointNames.length; i++) {
      var providerName = this.dataProviderMap[dataPointNames[i]];
      var provider = this.dataProviders[providerName];
      var deferred = deferreds[providerName];

      if (typeof deferred === "undefined") {
        deferred = new $.Deferred();
        deferreds[providerName] = deferred;
        provider(dataPoints, deferred);
      }

      localDeferreds.push(deferred);
    }

    return $.when.apply(null, localDeferreds);
  };

  /**
   * Refresh the whole UI
   *
   * @method refresh
   * @return {jQuery.Deferred} resolved when the entire UI is refreshed
   */
  DebuggerUi.prototype.refresh = function(){
    var ui = this;
    var dataPoints = {};
    var deferreds = {};

    return $.when.apply(ui, $.map(ui.views, function(view){
      return ui.refreshView(view, dataPoints, deferreds);
    }));
  };

  /**
   * Refresh a single view
   *
   * @method refreshView
   * @param {DebuggerUi.View} view the view to render
   * @param {Object} dataPoints optional object to contain the gathered data,
   *   keyed by requirement name
   * @param {Object} deferreds optional object to pass to #provideData
   */
  DebuggerUi.prototype.refreshView = function(view, dataPoints, deferreds){
    var dataRequirements = view.dataRequirements || [];
    dataPoints = dataPoints || {};
    deferreds = deferreds || {};

    return this.provideData(
      dataRequirements,
      dataPoints,
      deferreds
    ).done(function(){
      var localDataPoints = [];

      var j;
      for (j=0; j<dataRequirements.length; j++) {
        var pointName = dataRequirements[j];
        localDataPoints.push(dataPoints[pointName]);
      }

      view.render.apply(view, localDataPoints);
    });
  };

  // export the interface
  window.DebuggerUi = DebuggerUi;

})(window, jQuery);
