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
    this.input = $("<input type=\"text\" class=\"command-prompt\"></input>");
    this.inputContainer.html(this.input);
    this.form = $("<form>").append(this.cmdPrompt.clone(), this.inputContainer);
    this.el.append(this.history).append(this.form);

    this.form.on("submit", $.proxy(function(){
      var val = this.input.val();
      this.input.prop("disabled", true);

      this.input.val("");

      this.history.append(
        this.renderCommand(val)
      );

      this.handleCommand(val);

      return false;
    }, this));

    return this;
  }

  /**
   * Render a command item to insert into history
   *
   * @param {String} cmd command to render
   */
  CommandPrompt.prototype.renderCommand = function(cmd) {
    var command = $("<span class=\"command\"></span>").text(cmd);

    return $("<li>").append(this.cmdPrompt.clone()).append(command);
  };

  /**
   * Render a response item to insert into history
   *
   * @param {String} res response to render
   */
  CommandPrompt.prototype.renderResponse = function(res) {
    var response = $("<span class=\"response\"></span>").text(res);

    return $("<li>").append(this.resPrompt.clone()).append(response);
  };

  /**
   * The client should call handleResponse whenever it wants to respond.
   */
  CommandPrompt.prototype.handleResponse = function(response) {
    this.history.append(
      this.renderResponse(response)
    );
    this.input.prop("disabled", false);
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
