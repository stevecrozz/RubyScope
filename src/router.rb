# frozen_string_literal: true

Router = Hanami::Router.new do
  root to: ->(_env) { [200, {}, ['Welcome to Hanami::Router!']] }, as: :root

  get '/json/version', to: ->(env) { [200, {
    'Content-Type' => 'application/json'
  }, [JSON.dump(
    "Browser": "ruby/#{RUBY_VERSION}",
    "Protocol-Version": "1.1"
  )]] }

  get '/json', to: ->(env) { [200, {
  }, [JSON.dump([{
    "description": "rubyscope inspector",
    "devtoolsFrontendUrl": "chrome-devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=127.0.0.1:9229/7395d665-31b9-42cc-a796-937dc60b3a35",
    "devtoolsFrontendUrlCompat": "chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:9229/7395d665-31b9-42cc-a796-937dc60b3a35",
    "faviconUrl": "https://www.ruby-lang.org/favicon.ico",
    "id": "7395d665-31b9-42cc-a796-937dc60b3a35",
    "title": "some ruby project",
    "type": "ruby",
    "url": "file:///home/stevecrozz/Projects/some/file.rb",
    "webSocketDebuggerUrl": "ws://127.0.0.1:9229/7395d665-31b9-42cc-a796-937dc60b3a35"
  }]
  )]] }

  get '/7395d665-31b9-42cc-a796-937dc60b3a35', to: InspectServer
end
