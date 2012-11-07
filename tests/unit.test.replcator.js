var replcator = require('../lib/replcator');

module.exports = {

  "Test config prompt": function(test) {
    var repl = replcator.getInstance({
        prompt: '>> hello world: '
    });
    test.equals(repl.getPrompt(), '>> hello world: ');
    test.done();
  },

  "Test set/get prompt": function(test) {
    var repl = replcator.getInstance();
    repl.setPrompt('hello world');
    test.equals('hello world', repl.getPrompt());
    test.done();
  },

  "Test config bootstrap": function(test) {
    var repl = replcator.getInstance({
      bootstrap: function(repl) {
        test.ok(repl.getConfig());
        test.equals('testing', repl.getConfig().prompt);
        test.done();
      },
      prompt: 'testing',
      debug: true
    });
    repl.start();
  },

  "Test set/get/has program attributes": function(test) {
    var repl = replcator.getInstance();
    repl.setAttr('one', 'two');
    repl.setAttr('three', 'four');
    test.ok(repl.hasAttr('one'));
    test.ok(repl.hasAttr('three'));
    test.equals('two', repl.getAttr('one'));
    test.equals('four', repl.getAttr('three'));
    test.done();
  },

  "Test select": function(test) {
    var repl = replcator.getInstance();
    repl.on('select me', function(repl) {
      test.ok(repl.hasAttr('hello'));
      test.equals('world', repl.getAttr('hello'));
      test.done();
    });

    repl.setAttr('hello', 'world');
    repl.select('select me');
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
  }

};