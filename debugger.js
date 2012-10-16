$(function(){

  var resize = function(){
    var windowHeight = window.innerHeight;
    var consoleHeight = window.parseInt(
      $(".pane.console").css("height").replace(/px$/, ""), 10
    );
    var controlHeight = window.parseInt(
      $(".pane.control").css("height").replace(/px$/, ""), 10
    );

    $(".pane.content").css("height", windowHeight - consoleHeight - controlHeight);
  };

  $(window).resize(resize);
  resize();

  $("form.connect").on("submit", function(){
    $(this).serializeArray();
    var host = $(this).find("input[name=host]").val();
    var port = parseInt($(this).find("input[name=port]").val(), 10);

    var rubyDebugClient = new RubyDebugClient(host, port);

    var commandPrompt = null;
    var initCommandPrompt = function(){
      commandPrompt = new CommandPrompt($(".console"));

      // Handle commands by sending them to rubyDebugClient.eval
      commandPrompt.handleCommand = $.proxy(rubyDebugClient.eval, rubyDebugClient);

      // When we get a response from an eval instruction, the commandPrompt
      // should handle it.
      rubyDebugClient.onEval = $.proxy(commandPrompt.handleResponse, commandPrompt);
    }

    var setActiveLine = function(){
      var line = rubyDebugClient.line - 1;
      var scrollerHeight = $(myCodeMirror.getScrollerElement()).height();
      var lineHeight = $(myCodeMirror.getScrollerElement()).find("pre:first").height();
      $(".current-line").removeClass("current-line");
      myCodeMirror.setLineClass(line, null, "current-line");
      myCodeMirror.scrollTo(0, line * lineHeight - scrollerHeight / 2);
    };

    var lastFile = null;

    // populate the stack, and highlight the current line
    rubyDebugClient.onWhere = function(stack){
      var dl = $(".stack dl").empty();
      $.each(stack, function(){
        var dt = $("<dt>").text(this.context);
        var dd = $("<dd>").text(this.filename + ":" + this.line);

        if (this.current) {
          dt.addClass("current");
          dd.addClass("current");
        }

        dl.append(dt).append(dd);
      });

      if (!commandPrompt) {
        initCommandPrompt();
      }

      if (rubyDebugClient.file !== lastFile) {
        rubyDebugClient.list();
      } else {
        setActiveLine();
      }

      // keep track of which file we last had open
      lastFile = rubyDebugClient.file;
    }

    var myCodeMirror = null;

    // populate the list
    rubyDebugClient.onList = function(content){
      var section = $(".pane.content").empty();

      myCodeMirror = CodeMirror(section.get(0), {
        value: content,
        mode: "ruby",
        lineNumbers: true,
        readOnly: true,
        onGutterClick: function(cm, n) {
          var info = cm.lineInfo(n);
          if (info.markerText) {
            cm.clearMarker(n);
          } else {
            cm.setMarker(n, "<span style=\"color: #900\">●</span>");
          }
        }
      });

      setActiveLine();
    }

    $(".operations a.continue").click(function(){
      rubyDebugClient.controlFlow("continue");
      rubyDebugClient.where();
    });

    $(".operations a.step").click(function(){
      rubyDebugClient.controlFlow("step");
      rubyDebugClient.where();
    });

    $(".operations a.next").click(function(){
      rubyDebugClient.controlFlow("next");
      rubyDebugClient.where();
    });

    rubyDebugClient.connect(function(){
      $(".disconnected").hide();
      $(".connected").show();

      rubyDebugClient.where();
    });

    return false;
  });
});
