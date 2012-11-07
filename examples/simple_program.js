/*
 * To run 'node simple_program.js'
 */
var repl = require('../lib/replcator').getInstance();

repl.on('hello world', function(repl) {
  repl.setAttr('hello', 'world');
  console.log('You said hello %s', repl.getAttr('hello'));
  repl.next();
});

repl.on('goodbye', function(repl) {
  console.log('You said goodbye.');
  repl.next();
});

repl.start();
