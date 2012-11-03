require "rubygems"
require "bundler"
Bundler.require

Debugger.wait_connection = true
Debugger.start_remote

class App

  def initialize(name)
    @name = name
  end
  
  def hello
    puts "My name is #{get_name}"
  end
  
  def get_name
    debugger
    @name + suffix
  end
  
  def suffix
    rand(2**32).to_s
  end
  
end


App.new("bob").hello