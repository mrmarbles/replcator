/*
 * To run 'node simple_program.js'
 */
var replfactory = require('../lib/replcator');

var repl = replfactory.getInstance();

repl.on('hello', function(repl) {
    console.log('world');
    repl.next();
});

repl.on('goodbye', function(repl) {
    console.log('You said goodbye.');
    repl.next();
});

repl.on('secretme', function(repl) {
    repl.secret('Say something secret: ', function(secret) {
        console.log('Your secret is %s', secret);
        repl.next();
    });
});

repl.start();
