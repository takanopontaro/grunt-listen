# grunt-listen

Yet another watcher. Bridge between grunt and [Listen gem](https://github.com/guard/listen).


## Why Listen gem?

Watch provided by fs-module of node.js doesn't have much functions. When you need to watch statuses of files in detail, maybe in trouble.

Listen gem is a good solution. It provides you enough informations about changes of files. It's written in ruby but easy to bridge to Grunt via TCP.


## Getting started

If you don't install Ruby yet, get it at first. Ruby-2.0 recommended absolutely.

Install Listen gem. I recommend to use [Bundler](http://bundler.io). Get Gemfile from this repository and just type `bundle`.

If you are on Windows, need to install [wdm gem](https://github.com/Maher4Ever/wdm) too. It's a little messy. Install [DevKit](http://rubyinstaller.org/downloads/) under [this instruction](https://github.com/oneclick/rubyinstaller/wiki/Development-Kit) and type `bundle`.

Create your Gruntfile and run Grunt.


## Gruntfile

Here is a basic Gruntfile.

```ruby
listen: {
  dev: {
    port: 8888,
    dirs: ['/path/to/listened/dir'],
    options: {
      only: ['%r{\\.js$}', '%r{\\.(?:html?|css)$}']
    },
    listener: {
      '\\.js$': function (path, status) {
        console.log('js: ', path, status);
        return ['jshint:all'];
      },
      '': function (path, status) {
        console.log('html,css: ', path, status);
      }
    }
  }
}
```

### Available parameters

`name`: type (`default value if omissible`) : description

* `bundler`: boolean (`false`) : Use Bundler. Location of Gemfile is same as your Gruntfile.
* `host`: string (`127.0.0.1`) : Host of TCP server.
* `port`: integer : Port of TCP server.
* `dirs`: array of string : Paths of directories you want to listen.
* `options`: object (`{}`) : Options passed to Listen gem. See below for more details.
* `listener `: function or object : Listeners called when files change. See below.


### Options passed to Listen gem

Listen gem accepts some options. All options you set in your Gruntfile will passed to Listen gem directly. Check [here](https://github.com/guard/listen#options) to learn more about available options.

Note that you have to write patterns of RegExp as string instead of literal because of incompatibility of one between JavaScript and Ruby. And `\` must be `\\`.


### Listeners

You can get two ways below. In every way, you can return names of grunt-task that want to run next.

If `listener` is function, it'll be always called with informations of files as arguments when files change.

`added`, `modified`, `removed` are arrays of paths of changed files or empty arrays if nothing changed.

```js
listener: function (added, modified, removed) {
  if (added.length) {
    console.log('added: ' + added.join(', '));
    return ['jshint:all'];
  }
}
```

If `listener` is object, it's dealed as listeners for matched files with patterns like below. You can write patterns of RegExp as key. If defined an empty string `''` as key, it matches all files except patterns already defined. Note that if you set options like `only` or `ignore`, it has a priority to these settings.

`status` is string of `added`, `modified` or `removed`.

```js
listener: {
  '\\.js$': function (path, status) {
    console.log('js: ', path, status);
    return ['jshint:all'];
  },
  '\\.html?$': function (path, status) {
    console.log('html: ', path, status);
  },
  '': function (path, status) {
    console.log(path, status);
  }
}
```


## Notice

For more performance, I recommend you to set options `ignore` and `only`. By restricting listened directories and files, you can get better performance than you thought. Probably adjusting `latency` results good too.


## License

Licensed under the MIT license.


## Special thanks to

* [Thibaud Guillaume-Gentil (thibaudgg)](https://github.com/guard/listen)
* [Keiko Kitagawa](http://official.stardust.co.jp/keiko/)

