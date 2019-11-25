$int = ByebugInterface.new

Thread.new do
  $client = Byebug::Remote::Client.new($int)
  $client.start('localhost', 8989)
end

$int.wait_for_connection

#output = $int.execute('info file')
#binding.pry
#file = output.match(/\s*File (.*)(?= \() \((.*) lines/)
#output.match(/\s*File (?<file>.*)(?= \() \((?<lines>.*) lines.*Breakpoint line numbers: (?<breakpoint_line_numbers>[ \d]+).*Modification time: (?<mtime>[^\n]+).*Sha1 Signature: (?<hash>.*)\n/m)
#output = $int.execute_unmarshal('Marshal.dump($".filter { |f| File.exist?(f) })')


InspectServer = lambda do |env|
  logger = env['logger']

  if !Faye::WebSocket.websocket?(env)
    [404, { 'Content-Type' => 'text/plain' }, ['Not found']]
  end

  ws = Faye::WebSocket.new(env)
  manager = Devtools::DomainManager.new(
    logger: logger,
    sender: ws.method(:send),
    byebug: $int,
  )

  ws.on :message do |event|
    logger.info event.data
    manager.handle_message(**JSON.parse(event.data, symbolize_names: true))
  end

  ws.on :close do |event|
    p [:close, event.code, event.reason]
    ws = nil
  end

  # Return async Rack response
  ws.rack_response
end
