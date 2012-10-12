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

    // Highlights the currently active line in the code panel
    var highlightCurrentLine = function(){
      $("td.code .line").removeClass("current-line");
      $("td.code .line.number" + rubyDebugClient.line).addClass("current-line");
    }

    var shFileCache = {};
    var cachedList = function() {
      if (shFileCache[rubyDebugClient.file]) {
        // pull from the cache if possible
        console.log("hit the cache");
        $(".file-contents").html(shFileCache[rubyDebugClient.file]);
        highlightCurrentLine();
      } else {
        // otherwise issue the list
        rubyDebugClient.list();
      }
    }

    // populate the stack, and highlight the current line
    rubyDebugClient.onWhere = function(stack){
      var ol = $(".stack ol").empty();
      $.each(stack, function(){
        var li = $("<li>", {
          text: this.filename + ":" + this.line
        });

        if (this.current) {
          li.addClass("current");
        }

        li.appendTo(ol);
      });

      cachedList();

      if (!commandPrompt) {
        initCommandPrompt();
      }
    }



    // populate the list
    rubyDebugClient.onList = function(lines){
      var section = $(".file-contents");
      section.html(
        '<script type="syntaxhighlighter" class="brush: ruby">\n' +
        lines.join("\n") +
        '\n</script>'
      );
      SyntaxHighlighter.highlight();

      // save all this syntax-highlighted goodness in the cache
      shFileCache[rubyDebugClient.file] = section.html();

      highlightCurrentLine();
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
