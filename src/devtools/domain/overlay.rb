module Devtools
  module Domain
    class Overlay < Base
      def enable(id, *args)
        respond(id, {})
      end

      def setShowViewportSizeOnResize(id, *args)
        respond(id, {})
      end
    end
  end
end
