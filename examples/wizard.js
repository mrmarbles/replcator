var repl = require('../lib/replcator').getInstance({
  start: 'interview'
});

repl.on('interview', function(repl) {
  repl.wizard([
    {
      q: 'How old are you? ',
      eval: function(answer) {
        console.log("You're %s years old!?", answer);
      }
    },
    {
      q: 'Are you sure about that? ',
      eval: function(answer) {
        if (answer === 'no') {
          console.log("O.k., then I'll let you revise your answer.");
          return 0; // return to step 1
        }
      }
    },{
      q: 'So, how about those giants? '
    },{
      q: 'Do you want to start over? ',
      eval: function(answer) {
        if (answer === 'yes') {
          return 0; // return to step 1
        }
      }
    },{
      q: 'And finally, what is the answer to the ultimate question of life, the Universe,\n' +
          'and everything? ',
      eval: function(answer) {
        if (answer === '42') {
          console.log('CORRECT!');
        }
      }
    }

  ], function(repl, answers) {
    console.log(answers);
    console.log('Done.');
    repl.next();
  });
});

repl.start();
