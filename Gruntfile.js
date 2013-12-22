
module.exports = function (grunt) {

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({

    jshint: {
      all: ['Gruntfile.js']
    },

    listen: {
      dev: {
        bundler: true,
        port: 8888,
        dirs: ['/Users/shinji/Downloads', '/Users/shinji/Documents/Dev'],
        options: {
          only: ['%r{\\.js$}', '/\\.html?$/', '/\\.(?:css|rb)$/']
        },
        listener: {
          '\\.js$': function (path, status) {
            console.log('js: ', path, status);
            return ['jshint:all'];
          },
          '\\.html?$': function (path, status) {
            console.log('html:', path, status);
          },
          '': function (path, status) {
            console.log('css,rb:', path, status);
          }
        }
      },
      prod: {
        host: '127.0.0.1',
        port: 8888,
        dirs: ['/Users/shinji/Downloads'],
        options: {
          ignore: ['%r{/foo/bar}', '/\\.pid$/', '/\\.coffee$/'],
          'ignore!': '%r{/foo/bar}',
          only: '%r{\\.rb$}',
          latency: 0.5,
          wait_for_delay: 4,
          force_polling: true,
          polling_fallback_message: 'custom message',
          debug: true
        },
        listener: function (added, modified, removed) {
          if (added.length) {
            console.log('added: ' + added.join(', '));
          }
          if (modified.length) {
            console.log('modified: ' + modified.join(', '));
          }
          if (removed.length) {
            console.log('removed: ' + removed.join(', '));
          }
        }
      }
    }

  });

  ['dependencies', 'devDependencies'].forEach(function (key) {
    for (var task in pkg[key]) {
      if (task.indexOf('grunt-') === 0) grunt.loadNpmTasks(task);
    }
  });

  grunt.registerTask('default', ['listen:dev']);

};
