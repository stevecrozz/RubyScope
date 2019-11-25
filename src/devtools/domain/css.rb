module Devtools
  module Domain
    class CSS < Base
      def enable(id, *args)
        respond(id, {})
      end
    end
  end
end
