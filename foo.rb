require 'byebug'
require 'byebug/core'
require 'byebug/runner'

#runner = Byebug::Runner.new
#runner.remote = 'localhost:9999'
#runner.run
Byebug.wait_connection = true
Byebug.start_server('localhost')

def whatever
  byebug
  puts Time.now
  sleep 1
end

while true
  whatever
end
