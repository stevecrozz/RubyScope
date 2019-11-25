module Devtools
  module Domain
    class Base
      def initialize(sender:, logger:, byebug:)
        @sender = sender
        @logger = logger
        @byebug = byebug
      end

      def respond(id, result)
        emit(id: id, result: result)
      end

      def send_event(method, params)
        emit(method: method, params: params)
      end

      private def emit(data)
        json = JSON.dump(data)
        @logger.info "Emitting #{json}"
        @sender.call(json)
      end
    end
  end
end
