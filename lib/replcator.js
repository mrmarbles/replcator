var commander = require('commander'),
    router = require('stringrouter').getInstance();

var Replcator = function(config) {

    var cfg = config || {},
        callback = config.callback,
        name = config.name,
        parent = config.parent,
        prompt = config.startPrompt || '>> input: ',

        menu = [],
        attributes = config.attributes || {};

    var getName = function() {
        return name || 'root';
    };

    var getCallback = function() {
        return callback;
    };

    var setAttr = function(key, value) {
        attributes[key] = value;
    };

    var getAttr = function(key) {
        return attributes[key];
    };

    var getAttrs = function() {
        return attributes;
    };

    var hasAttr = function(key) {
        return attributes[key] ? true : false;
    };

    var on = function(pattern, callback) {
        var self = this, repl;
        menu.push(pattern);
        router.bindPattern(pattern, function(packet, routerCallback) {
            callback(repl = new Replcator({callback:callback, name:pattern, parent:self, attributes:packet.params}));
            routerCallback.call(undefined, repl, undefined);
        });
    };

    var select = function(pattern, callback) {
        router.dispatch(pattern, function(repl) {
            if (callback) {
                callback.call(undefined, repl);
            }
        });
    };

    var isRoot = function() {
        return parent ? false : true;
    };

    var getParent = function() {
        return parent;
    };

    var getBreadcrumb = function() {
        var crumbs = [], step = this;
        crumbs.push(this.getName());
        while (step = step.getParent()) {
            crumbs.unshift(step.getName());
        }
        return crumbs;
    };

    var getMenu = function() {
        return menu;
    };

    var up = function(name) {
        var step = this;
        while (step = step.getParent()) {
            if (step.getName() === name) {
                return step;
            }
        }
    };

    var down = function(name) {
        var options = this.getOptions(),
            index, opt;
        for (index in options) {
            if (opt = index.match(name) ? options[index] : undefined) {
                return opt;
            } else if (opt = options[index].shell.down(name)) {
                return opt;
            }
        }
    };

    var runner = function() {
        commander.prompt(prompt, function(input) {
            if (input === 'exit') {
                console.log('goodbye');
                process.stdin.destroy();
            } else {
                router.dispatch(input, function(repl, err) {
                    if (err) {
                        console.log('Unknown command: %s', input);
                    }
                    runner();
                });
            }
        });
    };

    // attach default helpers
    on('help', function(repl) {
        console.log(getMenu());
    });

    var getApi = function() {

        var common = {
            getName: getName,
            isRoot: isRoot,
            on: on,
            up: up,
            down: down,
            select: select,
            getCallback: getCallback,
            getParent: getParent,
            getBreadcrumb: getBreadcrumb,
            getMenu: getMenu,
            setAttr: setAttr,
            getAttr: getAttr,
            hasAttr: hasAttr,
            getAttrs: getAttrs
        }

        if (isRoot()) {
            common['start'] = runner;
        }

        return common;
    };

    return getApi();

};

exports.getInstance = function(config) {
    var cfg = config || {};
    console.log(cfg.startText || 'Program running on Replcator v0.0.1 (C) Brian Carr 2012 - welcome!');
    console.log(cfg.startHelp || "Type 'help' to view options and 'exit' to stop.");
    return new Replcator(cfg);
};