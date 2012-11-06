/*
 * To run 'node authenticated_program.js'
 */
var replfactory = require('../lib/replcator');

var repl = replfactory.getInstance({
    bootstrap: function(repl) {
        console.log('Welcome to Replcator v0.0.2 (c) Brian Carr.\n' +
            'Authenticated Program Example.  MIT License.');
    },
    teardown: function(repl) {
        repl.reset();
        console.log('Adios amigos!');
        process.stdin.destroy();
    },
    start: 'login',
    prompt: '>> command: '
});

repl.on('login', function(repl) {

    repl.ask(">> username: ", function(username) {
        repl.setAttr('username', username);
        repl.secret(">> password: ", function(password) {
            repl.setAttr('password', password);
            console.log('... Success!');
            console.log("Your password is '%s'", password);
            repl.setPrompt('>> ' + username + ': ');
            repl.next();
        });
    });

});

repl.on('whoami', function(repl) {
    console.log(repl.getAttr('username'));
    repl.next();
});

repl.on('logout', function(repl) {
    repl.reset();
    console.log('Logged out!');
    repl.setPrompt('>> input: ');
    repl.next();
});

repl.start();
