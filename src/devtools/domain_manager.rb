require 'json'

module Devtools
  class DomainManager
    def initialize(logger:, sender:, byebug:)
      @handlers = {}
      @logger = logger
      @sender = sender
      @byebug = byebug
    end

    def handle_message(id:, method:, params: {})
      domain, method = method.split('.')
      handler = fetch_handler(domain)
      return handler.send(method, id, **params) if handler.respond_to?(method)

      @logger.warn("Missing handler for #{domain}##{method}")
    end

    private def fetch_handler(domain)
      return @handlers[domain] if @handlers[domain]
      @handlers[domain] = Devtools::Domain.const_get(domain).new(
        logger: @logger,
        sender: @sender,
        byebug: @byebug,
      ) rescue nil
      return @handlers[domain] if @handlers[domain]
      @logger.warn("Missing domain class for #{domain}")

      nil
    end
  end
end
