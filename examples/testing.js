var keypress = require('keypress');

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

var secret = "";

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {

    if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
    } else if (key && key.name === 'enter') {
        console.log('ENtere!!');
        console.log(secret);
        process.stdin.pause();
    } else {
        secret = secret + key.name;
    }

});

process.stdin.setRawMode(true);
process.stdin.resume();