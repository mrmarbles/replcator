/*
 * To run 'node simple_program.js'
 */
var repl = require('../lib/replcator').getInstance();

/**
 * To execute this controller, enter in any 'do ******' string
 * into the console.
 */
repl.on('do {something}', function(repl, options) {
  console.log('You want to do %s', options.something);
  repl.next();
});

repl.on('goodbye', function(repl) {
  console.log('You said goodbye.');
  repl.next();
});

repl.start();
