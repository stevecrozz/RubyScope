module Devtools
  module Domain
    class Page < Base
      def enable(id, *args)
        respond(id, {})
      end

      def getResourceTree(id, *args)
        respond(id, {})
      end

      def getNavigationHistory(id, *args)
        respond(id, {})
      end

      def startScreencast(id, *args)
        respond(id, {})
      end

      def stopScreencast(id, *args)
        respond(id, {})
      end

      def setAdBlockingEnabled(id, *args)
        respond(id, {})
      end
    end
  end
end
