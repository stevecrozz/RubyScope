module Devtools
  module Domain
    class Network < Base
      def enable(id, *args)
        respond(id, {})
      end
    end
  end
end
