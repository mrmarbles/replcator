/*
 * To run 'node simple_program.js'
 */
var repl = require('../lib/replcator').getInstance();

repl.on('hello', function(repl) {
    console.log('world');
    repl.next();
});

repl.on('goodbye', function(repl) {
    console.log('You said goodbye.');
    repl.next();
});

repl.start();
