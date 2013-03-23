var replcator = require('../lib/replcator');

module.exports = {

  setUp: function(callback) {
    this.repl = replcator.getInstance();
    callback();
  },

  "Test config prompt": function(test) {
    var repl = replcator.getInstance({
        prompt: '>> hello world: '
    });
    test.equals(repl.getPrompt(), '>> hello world: ');
    test.done();
  },

  "Test set/get prompt": function(test) {
    this.repl.setPrompt('hello world');
    test.equals('hello world', this.repl.getPrompt());
    test.done();
  },

  "Test config bootstrap": function(test) {
    var repl = replcator.getInstance({
      bootstrap: function(repl, callback) {
        test.ok(repl.getConfig());
        test.equals('testing', repl.getConfig().prompt);
        test.done();
        callback();
      },
      prompt: 'testing',
      debug: true
    });
    repl.start();
  },

  "Test set/get/has program attributes": function(test) {
    this.repl.setAttr('one', 'two');
    this.repl.setAttr('three', 'four');
    test.ok(this.repl.hasAttr('one'));
    test.ok(this.repl.hasAttr('three'));
    test.equals('two', this.repl.getAttr('one'));
    test.equals('four', this.repl.getAttr('three'));
    test.done();
  },

  "Test simple select": function(test) {

    this.repl.on('select me', function(repl) {
      test.ok(repl.hasAttr('hello'));
      test.equals('world', repl.getAttr('hello'));
      test.done();
    });

    this.repl.setAttr('hello', 'world');
    this.repl.select('select me');
  },

  "Test complex select": function(test) {

    this.repl.on('echo {text}', function(repl, options) {
      test.ok(options.text);
      test.equals('hi', options.text);
      test.done();
    });

    this.repl.select('echo hi');

  },

  "Test config teardown": function(test) {
    var repl = replcator.getInstance({
      teardown: function(repl) {
        test.ok(repl.getConfig());
        test.equals('testing', repl.getConfig().prompt);
        test.done();
      },
      prompt: 'testing',
      debug: true
    });
    repl.select('exit');
  },

  "Test overridden exit listener": function(test) {
    var repl = replcator.getInstance({
      debug: true
    });
    repl.on('exit', function(repl) {
      test.done();
    });
    repl.select('exit');
  }

};