/*
 * To run 'node authenticated_program.js'
 */
var repl = require('../lib/replcator').getInstance({
  bootstrap: function(repl) {
    console.log('Welcome to Replcator v0.1.0 (c) Brian Carr.\n' +
        'Authenticated Program Example.  MIT License.');
  },
  teardown: function(repl) {
    console.log('Adios amigos!');
    process.stdin.destroy();
  },
  start: 'login',
  prompt: '>> command: '
});

repl.on('login', function(repl) {
  if (repl.getAttr('username')) {
    console.log("You're already logged in as %s", repl.getAttr('username'));
    repl.next();
  } else {
    repl.ask(">> username: ", function(username) {
      repl.setAttr('username', username);
      repl.secret(">> password: ", function(password) {
        repl.setAttr('password', password);
        console.log('\n... Success!');
        console.log("Your password is '%s'", password);
        repl.setPrompt('>> ' + username + ': ');
        repl.next();
      });
    });
  }
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
