(function(exports, $){

  /**
   * DebuggerUI is a generic front-end for a debugger interface. Instantiate
   * the DebuggerUi with an adapter to your back end of choice.
   *
   * @see 'debugger-ui/adapter/ruby-debug-client-adapter.js' for an example
   * @param {Object} options configuration object
   * @return {DebuggerUi}
   */
  var DebuggerUi = function(options){
    this.views = [];

    if (typeof options === "undefined") {
      throw "Adapter must be set";
    }

    this.requestHandlers = options.adapter.requestHandlers;
    this.dataProviders = options.adapter.dataProviders;
    this.dataProviderMap = options.adapter.dataProviderMap;
  };

  /**
   * The public interface for view registration. Generally views should
   * register themselves as soon as they're ready using this interface.
   *
   * @param {DebuggerUi.View} view view to register
   */
  DebuggerUi.prototype.registerView = function(view){
    this.views.push(view);
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
   * @param {Array} dataPointNames list of named data requirements
   * @param {Object} dataPoints data collection object
   * @param {Object} deferreds keyed by data provider name
   * @return {jQuery.Deferred} calls back when data requirements are fulfilled
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
   */
  DebuggerUi.prototype.refresh = function(){
    var ui = this;
    var dataPoints = {};
    var deferreds = {};

    $.when.apply(ui, $.map(ui.views, function(view){
      return ui.refreshView.bind(ui)(view, dataPoints, deferreds);
    })).then(function(){
      ui.lastDataPoints = dataPoints;
    });
  };

  DebuggerUi.prototype.refreshView = function(view, dataPoints, deferreds){
    var ui = this;
    var dataRequirements = view.dataRequirements || [];
    var viewDeferreds = [];
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

  /**
   * export the interface
   */
  window.DebuggerUi = DebuggerUi;

})(window, jQuery);
