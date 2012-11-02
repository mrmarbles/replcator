/**
 * Run this program with "node simple_program.js"
 */
var repl = require('../lib/replcator').getInstance();

repl.on('echo {text:.*}', function(repl) {
    console.log("You said: %s", repl.getAttr('text'));
});

repl.start();
