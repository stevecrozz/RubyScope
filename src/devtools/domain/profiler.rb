module Devtools
  module Domain
    class Profiler < Base
      def enable(id, *args)
        respond(id, {})
      end
    end
  end
end
