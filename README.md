[![Build Status](https://travis-ci.org/mrmarbles/replcator.png)](https://travis-ci.org/mrmarbles/replcator)

replcator
=========
A Read-eval-print loop / REPL / CLI / command line interface application framework for Nodejs.

Installation
---------------
     npm install replcator

Use
---------------
See examples for more detailed use-cases.

    var repl = require('replcator').getInstance();

    repl.on('do {something}', function(repl, options) {
      console.log('You want to do %s', options.something);
      repl.next();
    });

    repl.start();

Testing
---------------
     npm test

License
-------
[MIT License](http://mrmarbles.mit-license.org/ "Mit License")