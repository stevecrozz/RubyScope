# frozen_string_literal: true

require 'pry'
require 'logger'
require './src/router'
require './src/logging_middleware'

use LoggingMiddleware, Logger.new(STDOUT)
use Rack::ContentLength
use Rack::ShowExceptions
run Router
