module Devtools
  module Domain
    class Target < Base
      def enable(id, *args)
        respond(id, {})
      end

      def setDiscoverTargets(id, *args)
        respond(id, {})
      end

      def setRemoteLocations(id, *args)
        respond(id, {})
      end
    end
  end
end
