module Devtools
  module Domain
    class Emulation < Base
      def enable(id, *args)
        respond(id, {})
      end

      def setTouchEmulationEnabled(id, *args)
        respond(id, {})
      end

      def setEmitTouchEventsForMouse(id, *args)
        respond(id, {})
      end

      def setFocusEmulationEnabled(id, *args)
        respond(id, {})
      end
    end
  end
end
