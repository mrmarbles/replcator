var keypress = require('keypress');

var Replcator = function(config) {

    var options = [],
        attributes = {},
        sshh = '';

    var setAttr = function(key, value) {
        attributes[key] = value;
    };

    var hasAttr = function(key) {
        return attributes[key] ? true : false;
    };

    var getAttr = function(key) {
        return attributes[key];
    };

    var on = function(name, callback) {
        options.push({
            name: name,
            callback: callback,
            repl: this
        });
    };

    var getOption = function(name) {
        for (var i = 0; i < options.length; i ++) {
            if (options[i].name === name) {
                return options[i];
            }
        }
    };

    var secret = function(question, callback) {

        process.stdin.setRawMode(true);
        process.stdin.setEncoding('utf8');
        process.stdout.write(question);

        // listen for the "keypress" event
        process.stdin.on('keypress', function (ch, key) {

            if (key && key.ctrl && key.name == 'c') {
                process.stdin.removeAllListeners('keypress');
                process.stdin.setRawMode(false);
                process.stdin.pause();
            } else if (key && key.name === 'enter') {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeAllListeners('keypress');
                var mysecret = sshh;
                sshh = '';
                callback(mysecret);
            } else {
                sshh = sshh + key.name;
            }

        });
    };

    var query = function(question, callback, validator) {
        process.stdin.setEncoding('utf8');
        process.stdout.write(question);
        process.stdin.once('data', function(data) {
            var input = data.toString().replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            if (validator && !validator(input)) {
                query(question, callback, validator);
            } else {
                callback(input);
            }
        }).resume();
    };

    var runner = function(option) {
        var opt;
        if (opt = getOption(option)) {
            select(opt);
        } else {
            query(getPrompt(), function(input) {
                if (opt = getOption(input)) {
                    select(opt);
                } else {
                    console.log('Unknown option: %s', input);
                    runner();
                }
            });
        }
    };

    var start = function() {

        if (config.bootstrap) {
            config.bootstrap(this);
        }

        this.setPrompt(config.prompt || '>>  input: ');

        if (config.start && (opt = getOption(config.start))) {
            select(opt);
        } else if (!config.debug) {
            runner();
        }

    };

    var getConfig = function() {
        return config;
    };

    var select = function(option) {
        if (typeof option === 'string') {
            option = getOption(option);
        }
        option.callback(option.repl);
    };

    var next = function() {
        runner();
    };

    var reset = function() {
        attributes = {};
    };

    var getPrompt = function() {
        return config.prompt;
    };

    var setPrompt = function(p) {
        config.prompt = p;
    };

    return {
        ask: query,
        secret: secret,
        start: start,
        on : on,
        next: next,
        select: select,
        setAttr: setAttr,
        getAttr: getAttr,
        hasAttr: hasAttr,
        reset: reset,
        getPrompt: getPrompt,
        setPrompt: setPrompt,
        getConfig: getConfig
    };

};

exports.getInstance = function(config) {

    var cfg = config || {},
        repl  = new Replcator(cfg);

    repl.on('exit', cfg.teardown || function(repl) {
        console.log('Goodbye!');
        process.stdin.destroy();
    });

    // make `process.stdin` begin emitting "keypress" events
    keypress(process.stdin);

    return repl;
};