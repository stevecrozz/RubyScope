module Devtools
  module Domain
    class ServiceWorker < Base
      def enable(id, *args)
        respond(id, {})
      end
    end
  end
end
