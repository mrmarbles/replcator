var replcator = require('../lib/replcator');

module.exports = {

    setUp: function(callback) {
        this.repl = replcator.getInstance();
        callback();
    },

    "Test isRoot()": function(test) {
        test.ok(this.repl.isRoot());
        test.equals(this.repl.getName(), "root");
        test.done();
    },

    "Test set root level manual attribute set/get/has": function(test) {
        this.repl.setAttr("one", "two");
        test.ok(this.repl.hasAttr("one"));
        test.equals(this.repl.getAttr("one"), "two");
        test.done();
    },

    "Test child REPL": function(test) {
        this.repl.on('select me', function(repl) {
            test.equals(repl.getName(), 'select me');
            test.equals(repl.getParent().getName(), 'root');
            test.done();
        });
        this.repl.select('select me');
    },

    "Test select()": function(test) {

        this.repl.on('do something', function(repl) {
            test.ok(repl);
            test.equals(repl.getName(), 'do something');
        });

        this.repl.select('do something', function(repl) {
            test.equals(repl.getName(), 'do something');
            test.done();
        });

    },

    "Test nested select()": function(test) {

        this.repl.on('one', function(repl) {
            test.equals(repl.getName(), 'one');
            repl.on('two', function(repl) {
                test.equals(repl.getName(), 'two');
                repl.on('three', function(repl) {
                    test.equals(repl.getName(), 'three');
                    test.done();
                });
            });
        });

        this.repl.select('one', function(repl) {
            repl.select('two', function(repl) {
                repl.select('three');
            });
        });

    },

    "Test getMenu()": function(test) {
        this.repl.on('option one', undefined);
        this.repl.on('option two', undefined);
        this.repl.on('option three', undefined);

        var menu = this.repl.getMenu();

        test.ok(menu);
        test.equals(menu.length, 3);
        test.equals(menu[0], 'option one');
        test.equals(menu[1], 'option two');
        test.equals(menu[2], 'option three');
        test.done();
    },

    "Test parameterized attribute": function(test) {
        this.repl.on('one {two} three {four}', function(repl) {
            test.ok(repl.getAttrs());
            test.equals(repl.getAttr("two"), "brian");
            test.equals(repl.getAttr("four"), "world");
            test.done();
        });
        this.repl.select('one brian three world');
    },

    "Test up() - one degree of separation": function(test) {
        this.repl.on('level one', function(repl) {
            var up = repl.up('root');
            test.ok(up);
            test.equals(up.getName(), 'root');
            test.done();
        });
        this.repl.select('level one');
    },

    "Test getBreadcrumb()": function(test) {

        this.repl.on('one', function(repl) {
            repl.on('two', function(repl) {});
        });

        this.repl.select('one', function(repl) {
            repl.select('two', function(repl) {
                test.ok(repl);
                var crumbs = repl.getBreadcrumb();
                test.equals(crumbs.length, 3);
                test.equals(crumbs[0], 'root');
                test.equals(crumbs[1], 'one');
                test.equals(crumbs[2], 'two');
                test.done();
            });
        });

    },

    tearDown: function(callback) {
        this.repl = null;
        callback();
    }

};