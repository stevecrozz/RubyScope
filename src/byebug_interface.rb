class ByebugInterface < Byebug::LocalInterface
  attr_reader :input, :output, :error

  def initialize
    super()
    @input = StringIO.new
    @error = StringIO.new
    @command_queue = Queue.new
    @response_queue = Queue.new
    @output = StringIO.new
  end

  # called when detecting a prompt, meaning the previous output is complete and
  # we're ready for new commands
  def read_command(*args)
    handle_response
    command_queue.shift
  end

  def execute(command)
    @command_queue.push(command)
    @response_queue.pop.chomp
  end

  def execute_unmarshal(command)
    response = execute(command)
    Marshal.load(eval(response))
  end

  def handle_response
    @response_queue.push(@output.string)
    @output.reopen
  end

  def wait_for_connection
    @response_queue.pop
    @output.reopen
  end
end
