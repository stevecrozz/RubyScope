module Devtools
  module Domain
    class Inspector < Base
      def enable(id, *args)
        respond(id, {})
      end
    end
  end
end
