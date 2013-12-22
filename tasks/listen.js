
module.exports = function (grunt) {

  var task, data, done, timer, client, server, host, winBundler, listeners,
      path = require('path'),
      net = require('net'),
      isWin = process.platform == 'win32',
      ruby = isWin ? 'rubyw' : 'ruby',
      retry = 5;

  if (isWin) {
    grunt.util.spawn({cmd: 'where', args: ['bundle']}, function (e, res) {
      if (!e) winBundler = res.stdout.match(/^.+$/m)[0];
    });
  }

  function runServer () {

    var params,
        opts = {detached: true},
        args = [
          path.join(__dirname, 'server.rb'),
          JSON.stringify(data.options) || '{}',
          host,
          data.port,
        ].concat(data.dirs);

    if (data.bundler) {
      params = isWin ?
        {cmd: ruby, args: [winBundler, 'exec', ruby].concat(args), opts: opts} :
        {cmd: 'bundle', args: ['exec', 'ruby'].concat(args), opts: opts};
    }
    else {
      params = {cmd: ruby, args: args, opts: opts};
    }

    server = grunt.util.spawn(params);

    server.stdout.on('data', function init (msg) {
      setTimeout(connect, 100);
      this.removeListener('data', init);
    });

    server.stderr.on('data', function (msg) {
      grunt.fail.fatal(msg);
    });

  }

  function connect () {

    client = net.connect(data.port, host);

    client.on('error', function (msg) {
      client.destroy();
      if (!server) {
        grunt.log.ok('Running server...');
        runServer();
      }
      else if (0 < retry--) {
        setTimeout(connect, 1000);
      }
      else {
        grunt.fail.fatal(msg);
      }
    });

    client.on('connect', function () {
      grunt.log.ok('Connected to ' + host + ':' + data.port);
      grunt.log.ok('Bundler: ' + (data.bundler ? 'yes' : 'no'));
      grunt.log.ok('Dirs: ' + data.dirs.join(', '));
      grunt.log.ok('Now listening...'.cyan);
    });

    client.on('data', function (msg) {
      msg = msg.toString().trim();
      if (msg) {
        msg = eval(msg);
        var res = listeners ? each(msg) : all(msg),
            tasks = [].concat(res).filter(function (val) { return is(val, 'Array', 'String'); });
        tasks.push(task);
        done();
        clearInterval(timer);
        grunt.task.run(tasks);
      }
    });

  }

  function all (msg) {
    return data.listener.call(data, msg.added, msg.modified, msg.removed);
  }

  function each (msg) {
    var tasks = [];
    ['added', 'modified', 'removed'].forEach(function (status) {
      msg[status].forEach(function (filepath) {
        var fn = listeners.def;
        listeners.each.some(function (h) {
          if (h.re.test(filepath)) {
            fn = h.fn;
            return true;
          }
        });
        if (fn) tasks = tasks.concat(fn.call(data, filepath, status));
      });
    });
    return tasks;
  }

  function is (obj) {
    var cls = Object.prototype.toString.call(obj).slice(8, -1);
    for (var i = 1; i < arguments.length; i++) {
      if (cls === arguments[i]) return true;
    }
    return false;
  }

  grunt.registerMultiTask('listen', 'Yet another watcher.', function () {

    done = this.async();
    timer = setInterval(new Function, 28800);

    if (!client) {
      task = this.name + ':' + this.target;
      data = this.data;
      host = data.host || '127.0.0.1';
      if (is(data.listener, 'Object')) {
        listeners = {def: null, each: []};
        for (var n in data.listener) {
          if (n === '') {
            listeners.def = data.listener[n];
            continue;
          }
          var re = new RegExp;
          re.compile(n);
          listeners.each.push({re: re, fn: data.listener[n]});
        }
      }
      connect();
    }
    else {
      grunt.log.ok('Listening...');
    }

  });

};
