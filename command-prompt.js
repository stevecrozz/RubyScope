(function(exports) {

  /**
   * Creates an instance of the command prompt
   *
   * @param {Element} el element to bind the command prompt
   */
  function CommandPrompt(el) {
    this.el = el;

    this.cmdPrompt = $("<span class=\"prompt\">irb:&gt;</span>");
    this.resPrompt = $("<span class=\"prompt\">=&gt;</span>");
    this.history = $("<ol class=\"command-history\"></ol>");
    this.inputContainer = $("<div class=\"command-prompt-container\">");
    this.form = $("<form>").append(this.cmdPrompt.clone(), this.inputContainer);
    this.el.append(this.history).append(this.form);

    this.cm = CodeMirror(this.inputContainer.get(0), {
      mode: "ruby",
      extraKeys: this.getCodeMirrorKeyMap()
    });

    return this;
  }

  CommandPrompt.prototype.getCodeMirrorKeyMap = function(){
    return {
      "Enter": $.proxy(this, "send")
      // "Ctrl-Enter": "newlineAndIndent"
    };
  };

  CommandPrompt.prototype.send = function(){
    var val = this.cm.getValue();

    this.cm.setValue("");
    this.cm.setOption("readOnly", "nocursor");

    this.history.append(
      this.renderCommand(val)
    );

    this.handleCommand(val);
  };

  /**
   * Render a command item to insert into history
   *
   * @param {String} cmd command to render
   */
  CommandPrompt.prototype.renderCommand = function(cmd) {
    var command = $("<span class=\"command cm-s-default\"></span>");
    CodeMirror.runMode(cmd, "ruby", command.get(0));

    return $("<li>").append(this.cmdPrompt.clone()).append(command);
  };

  /**
   * Render a response item to insert into history
   *
   * @param {String} res response to render
   */
  CommandPrompt.prototype.renderResponse = function(res) {
    var response = $("<span class=\"response cm-s-default\"></span>").text(res);
    CodeMirror.runMode(res, "ruby", response.get(0));
    this.cm.setOption("readOnly", false);
    this.cm.focus();

    return $("<li>").append(this.resPrompt.clone()).append(response);
  };

  /**
   * The client should call handleResponse whenever it wants to respond.
   */
  CommandPrompt.prototype.handleResponse = function(response) {
    this.history.append(
      this.renderResponse(response)
    );
  };

  /**
   * Implemented by the client. We call this method when the user enters a
   * command.
   */
  CommandPrompt.prototype.handleCommand = function(command) {};

  /**
   * Export the interface
   */
  exports.CommandPrompt = CommandPrompt;

})(window);
