/*global DebuggerUi:false*/
(function($, DebuggerUi){

  DebuggerUi.Adapter.RubyDebugClientAdapter = function(rdc){
    return {
      requestHandlers: {
        switchThread: rdc.switchThread.bind(rdc),
        switchFrame: rdc.frame.bind(rdc),
        requestBreakpoint: rdc.requestBreakpoint.bind(rdc),
        clearBreakpoint: rdc.clearBreakpoint.bind(rdc),
        evaluate: rdc.evaluate.bind(rdc),
        cont: function(){
          rdc.controlFlow("continue");
        },
        step: function(){
          rdc.controlFlow("step");
        },
        next: function(){
          rdc.controlFlow("next");
        },
        up: function(){
          rdc.controlFlow("up");
        },
        down: function(){
          rdc.controlFlow("down");
        }
      },
      dataProviders: {
        stack: function(dataPoints, deferred){
          rdc.where(function(stack){
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
          rdc.listBreakpoints(function(breakpoints){
            dataPoints.breakpoints = breakpoints;
            deferred.resolve();
          });
        },
        threads: function(dataPoints, deferred){
          rdc.threads(function(threads){
            dataPoints.threads = threads;
            deferred.resolve();
          });
        },
        files: function(dataPoints, deferred){
          rdc.files(function(files){
            dataPoints.files = files;
            deferred.resolve();
          });
        },
        fileContents: function(dataPoints, deferred){
          var resolver = function(code){
            dataPoints.fileContents = code;
            deferred.resolve();
          };

          if (typeof dataPoints.openFile === "undefined") {
            rdc.list(resolver);
          } else {
            rdc.readFile(dataPoints.openFile, resolver);
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
      }
    };
  };

})(jQuery, DebuggerUi);

