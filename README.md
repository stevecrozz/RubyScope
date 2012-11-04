#RubyScope#

RubyScope is a GUI for ruby-debug and a Chrome app. It works by
connecting to a remote ruby-debug instance over a TCP socket.

##Installation##
After installing Chrome v24 or later, enable developer mode using the
checkbox and click the 'Load unpacked extension...' button.

##Usage##
Install ruby-debug and initialize the remote debugger with:
```ruby
Debugger.wait_connection = true
Debugger.start_remote
```

Add at least one initial breakpoint to your ruby program with the line:
```ruby
debugger
```

Connect to the remote debugger with RubyScope and enjoy the GUI.

##Example##
1. Open the example folder: 'cd example'
2. Install the example bundle: 'bundle install'
3. Run the example app: 'ruby app.rb'
4. Start RubyScope and click connect

##Copyright##
Copyright (c) 2012, Stephen Crosby. All rights reserved.

##License##
RubyScope is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see
<http://www.gnu.org/licenses/>.
