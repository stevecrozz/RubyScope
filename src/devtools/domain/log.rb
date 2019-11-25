module Devtools
  module Domain
    class Log < Base
      def enable(id, *args)
        respond(id, {})
      end

      def startViolationsReport(id, *args)
        respond(id, {})
      end
    end
  end
end
