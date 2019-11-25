module Devtools
  module Domain
    class Debugger < Base
      def initialize(*args)
        @files_loaded = Set.new
        @pause_on_exceptions = 'none'
        @breakpoints_active = true

        super
      end

      def enable(id, *args)
        respond(id, {})
        get_file_info
        paused
        @byebug.execute_unmarshal('Marshal.dump($".filter { |f| File.exist?(f) })').each(&method(:add_file))
      end

      def setPauseOnExceptions(id, state:, **kwargs)
        @pause_on_exceptions = state
        respond(id, {})
      end

      def setAsyncCallStackDepth(id, *args)
        respond(id, {})
      end

      def setBlackboxPatterns(id, *args)
        respond(id, {})
      end

      def getScriptSource(id, scriptId:)
        respond(id, scriptSource: File.read(scriptId))
      end

      def getPossibleBreakpoints(id, start:, **kwargs)
        respond(id, locations: [ scriptId: start[:scriptId], lineNumber: start[:lineNumber] ])
      end

      def setBreakpointsActive(id, active:, **kwargs)
        @breakpoints_active = active
      end

      def setBreakpointByUrl(id, lineNumber:, url:, **kwargs)
      end

      def evaluateOnCallFrame(id, callFrameId:, expression:, **kwargs)
        response = @byebug.execute(expression)
        respond(id,
          result: {
            type: 'string',
            value: response,
            description: response,
          }
        )
      end

      private def paused
        framedata = $int.execute('where').split("\n").map do |frmstr|
          frmstr.match(/(?<current>-->)? ?(?<cframe>ͱ--)? #(?<number>\d+)\s+(?<ctx>.*) at (?<file>.*):(?<line>\d+)/)
        end
        send_event("Debugger.paused",
          callFrames: framedata.map { |fd|
            {
              callFrameId: fd[:number],
              functionName: 'foo', #fd[:ctx],
              scopeChain: ['global'],
              location: {
                scriptId: fd[:file],
                lineNumber: fd[:line].to_i - 1,
                url: "http://localhost#{fd[:file]}",
              }
            }
          },
          reason: 'debugCommand',
        )

      end

      private def get_file_info
        output = @byebug.execute('info file')
        matches = output.match(/\s*File (?<file>.*)(?= \() \((?<lines>.*) lines.*Breakpoint line numbers: (?<breakpoint_line_numbers>[ \d]+).*Modification time: (?<mtime>[^\n]+).*Sha1 Signature: (?<hash>.*)\n/m)
        add_file(matches[:file])
        #file:"/home/stevecrozz/Projects/stevecrozz/rubyscope/foo space.rb"
        #lines:"15"
        #breakpoint_line_numbers:"1 2 3 8 9 11 12 13 14"
        #mtime:"2019-11-24 17:28:58 -0800"
        #hash:"1ecdea512fa893c8d6a233f714b9e6309aa1df3c"
        #1
      end

      private def add_file(path)
        return if @files_loaded.include?(path)

        send_event("Debugger.scriptParsed",
          scriptId: path,
          url: "http://localhost#{path}",
          startLine: 0,
          startColumn: 0,
          endColumn: 0,
          executionContextId: 1,
        )

        @files_loaded << path
      end
    end
  end
end
