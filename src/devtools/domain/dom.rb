module Devtools
  module Domain
    class DOM < Base
      def enable(id, *args)
        respond(id, {})
      end
    end
  end
end
