(function(exports, $){

  /**
   * DebuggerUI is a generic front-end for a debugger interface
   */
  var DebuggerUi = function(options){
    this.lastFile = null;
    this.lastLine = null;
    this.commandPrompt = null;
    this.debuggerClient = null;
    this.views = [];
    this.adapter = options.adapter;

    this.requestHandlers = this.adapter.requestHandlers;
    this.dataProviders = this.adapter.dataProviders;
    this.dataProviderMap = this.adapter.dataProviderMap;
  };

  DebuggerUi.prototype.registerView = function(view){
    this.views.push(view);
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
   * Open the console
   */
  DebuggerUi.prototype.initConsole = function(){
  };

  DebuggerUi.prototype.provideData = function(dataPoints, deferreds, dataPointNames){
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
      dataPoints,
      deferreds,
      dataRequirements
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
