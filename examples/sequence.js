var repl = require('../lib/replcator').getInstance({
  start: 'askmesomething'
});

repl.on('askmesomething', function(repl) {
  repl.sequence([
    'How are you doing today? ',
    "That's great - what's your favorite color? "
  ], function(repl, answers) {
    console.log(answers);
    console.log('Done!');
    repl.exit();
  });
});

repl.start();
