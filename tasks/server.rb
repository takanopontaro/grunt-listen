#!/usr/bin/env ruby

require 'json'
require 'listen'
require 'socket'

STDOUT.sync = true
Thread.abort_on_exception = true

options, host, port, *dirs = ARGV
connections = 0
server = TCPServer.new(host, port)

options = JSON.parse(options).each_with_object({}) do |(key, val), h|
  key = key.to_sym
  if /^(?:ignore!?|only)$/ === key
    [val].flatten.each { |pat| (h[key] ||= []) << eval(pat) }
  else
    h[key] = val
  end
end

puts 'http://official.stardust.co.jp/keiko/'

catch :block do
  while true
    Thread.start(server.accept) do |s|
      listener = Listen.to(*dirs, options) do |modified, added, removed|
        s.write("({modified:#{modified}, added:#{added}, removed:#{removed}})")
      end
      listener.start
      connections += 1
      while s.gets; end
      listener.stop
      s.close
      throw :block if (connections -= 1) == 0
    end
  end
end

server.close
