# frozen_string_literal: true

class CodeReloader
  #@listener = Listen.to(*loader.root_dirs.keys) do |modified, added, removed|
    #@dirty = true
  #end
  #@listener.start

  def initialize(app, loader)
    @app = app
    #@loader = loader
  end

  def call(env)
    #@listener.reload if @dirty
    @app.call(env)
  end
end
