module Devtools
  module Domain
    class Runtime < Base
      def enable(id, *args)
        respond(id, {})
        send_event('Runtime.executionContextCreated',
          context: {
            id: 1,
            origin: "",
            name: "#{$0}#{Process.pid}",
            auxData: { isDefault: true }
          }
        )
      end

      def getIsolateId(id, *args)
        respond(id, {})
      end

      def runIfWaitingForDebugger(id, *args)
        respond(id, {})
      end

      def evaluate(id, expression:, **kwargs)
        matches = expression.match(/\(async function\(\){ await (.*); }\)\(\)/)
        response = @byebug.execute(matches[1])
        respond(id,
          type: 'string',
          value: response,
          description: response,
        )
      end

      def compileScript(id, expression:, **kwargs)
        respond(id, {})
      end
    end
  end
end
