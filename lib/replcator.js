var keypress = require('keypress'),
  tty = require('tty'),
  routerFactory = require('stringrouter'),
  router, attributes, prompt, config;

/**
 * @param cfg
 * @constructor
 */
function Replcator(cfg) {

  attributes = [];
  prompt = cfg.prompt || '>> input: ';
  config = cfg;

  router = routerFactory.getInstance({
    noMatch: 404
  });

};

/**
 * Adds a key/value pair to the current Replcator
 * instance.  Value can be later retrieved with
 * getAttr() method.
 *
 * @param key
 * @param value
 */
Replcator.prototype.setAttr = function(key, value) {
  attributes[key] = value;
};

/**
 * Returns a boolean value indicating whether
 * or not the current Replcator instance has
 * an attribute with the given key.
 *
 * @param key
 * @return {Boolean}
 */
Replcator.prototype.hasAttr = function(key) {
  return attributes[key] ? true : false;
};

/**
 * Returns the value of a given attibuted,
 * based off of the provided key.
 *
 * @param key
 * @return {*}
 */
Replcator.prototype.getAttr = function(key) {
  return attributes[key];
};

/**
 * Registers a selectable value {String} or 'option'
 * with the Replcator instance.  The format of this option
 * adheres to the stringtokenizer module pattern rules meaning they
 * can be simple strings;
 *
 * .on('login',.....
 *
 * or patterns that contain named variables;
 *
 * .on('do {something}....
 *
 * or even patterns with embeded regular expressions;
 *
 * .on('login as {username:[a-zA-Z]{2,10}}...
 *
 * In the cases of options containing named variables and/or embeded
 * regular expressions will provide those named values to the provided
 * controllerCallback function as an argument named 'options'.
 *
 * Once one or more of these
 * selectable values have been added via this method to
 * the Replcator, then start() must be invoked to begin
 * the read-eval-print-loop.  Entries via stdin are then
 * matched to these options.  If a match is detected, then the
 * provided callback is invoked.
 *
 * @param matcher
 * @param controllerCallback
 */
Replcator.prototype.on = function(matcher, controllerCallback) {
  var self = this;
  router.unBindPattern(matcher); // allows consumers to override built-in listeners
  router.bindPattern(matcher, function(packet, routerCallback) {
    // passes in a reference to the repl instance as well as any configured options/values
    controllerCallback(self, packet.params);
  });
};

/**
 * Removes a previously registered matcher from
 * the list of available options on the current
 * repl instance.
 *
 * @param matcher
 */
Replcator.prototype.un = function(matcher) {
  router.unBindPattern(matcher);
};

/**
 * Prompts for input that will not be displayed as typed.
 *
 * @param question
 * @param callback
 */
Replcator.prototype.secret = function(question, callback) {

  var sshh;

  function goRaw(bool) {
    (typeof process.stdin.setRawMode !== 'undefined') ?
      process.stdin.setRawMode(bool) : tty.setRawMode(bool);
  }

  keypress(process.stdin);
  goRaw(true);
  process.stdin.setEncoding('utf8');
  process.stdout.write(question);
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name === 'c') {
      process.stdin.removeAllListeners('keypress');
      goRaw(false);
      process.stdin.pause();
    } else if (key && key.name === 'enter') {
      process.stdin.removeAllListeners('keypress');
      goRaw(false);
      process.stdin.pause();
      callback(sshh.replace(/^undefined/, ''));
    } else {
      sshh += key.name;
    }
  });
};

/**
 * Prompts for input, passing the response into the
 * provided callback function.
 *
 * @param question
 * @param callback
 * @param validator
 */
Replcator.prototype.ask = function(question, callback, validator) {
  var self = this;
  process.stdin.setEncoding('utf8');
  process.stdout.write(question);
  process.stdin.once('data', function(data) {
    var input = data.toString().replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    if (validator && !validator(input)) {
      self.ask(question, callback, validator);
    } else {
      callback(input);
    }
  }).resume();
};

/**
 * Delegate method used internally to
 * begin a read-eval print loop.  Should
 * never be invoked on it's own.  The start() method
 * should be invoked in order to properly initialize
 * the input loop.
 */
Replcator.prototype.runner = function() {
  var self = this;
  this.ask(prompt, function(input) {
    self.select(input);
  });
};

/**
 * Will invoke the corresponding callback of a
 * previously registered object (via the 'on()' method)
 * if one corresponds to the provided 'option' parameter.
 *
 * @param option
 */
Replcator.prototype.select = function(option) {
  var self = this;
  router.dispatch(option, function(err, packet) {
    if (err && err === 404) {
      console.log('Unknown command %s', option);
      self.runner();
    }
  });
};

/**
 * Initializes and then starts the read-eval-print loop.
 */
Replcator.prototype.start = function() {

  var self = this, go = function() {
    self.setPrompt(prompt || '>>  input: ');
    var start = self.getConfig().start;
    if (start && (router.hasMatch(start))) {
      self.select(start);
    } else if (!self.getConfig().debug) {
      self.runner();
    }
  };

  if (config.bootstrap) {
    config.bootstrap(this, function() {
      go();
    });
  } else {
    go();
  }

};

/**
 * Creates a sequence of user input queries.  The 'questions'
 * parameter must be an array of strings.  Each element in the array
 * will be presented to the user for input.  Once the iteration reaches
 * the end of the array, the provided callback will be invoked, and passed
 * an array of answers corresponding to the ordinal posiiton of each question.
 *
 * @param questions
 * @param callback
 */
Replcator.prototype.sequence = function(questions, callback, answers) {
  var q = questions.splice(0, 1), self = this, ans = answers || [];
  if (q.length) {
    this.ask(q[0], function(answer) {
      ans.push(answer);
      self.sequence(questions, callback, ans);
    });
  } else {
    callback(self, ans);
  }
};

/**
 * Similar to but more sophisticated than a sequence, a wizard allows bi-directional
 * traversal through it's provided steps based off of user input.  The steps parameter
 * must contain an array of objects representing each step in the wizard.
 *
 * A step is an object containing one or two properties;
 *
 *  * q: (required) This is a string (i.e. 'question') that will be rendered in the repl
 *    and prompt for input - much in the same way the ask() method does.
 *
 *  * eval: (optional) a callback function that will be invoked prior to rendering
 *    the next step in the wizard.  It will be provided the value of the input
 *    from the question (q).  The eval callback may optionally return an integer value
 *    representing a step that will be rendered to the user as the next step.  If no value
 *    is returned from this method, or no such position exists, then the next step in
 *    the wizard will be rendered.
 *
 * When the final step in the wizard is reached, and user input is provided, then the provided callback
 * function will be invoked, passing in the repl instance itself and an array of answers whose
 * ordinal position corresponds to the steps themselves, respectively.
 *
 * @param steps
 * @param callback
 * @param start
 */
Replcator.prototype.wizard = function(steps, callback, start, answers) {
  var begin = start || 0, self = this, step, ans = answers || [];
  if (step = steps[begin]) {
    this.ask(step.q, function(answer) {
      var next = step.eval && step.eval(answer);
      ans[begin] = answer;
      if (next || next === 0) {
        self.wizard(steps, callback, next, ans)
      } else {
        self.wizard(steps, callback, begin + 1, ans);
      }
    });
  } else {
    callback(self, ans);
  }
};

/**
 * Returns an object whose properties represent the configuration
 * that was passed into the initial getInstance() method.
 *
 * @return {*}
 */
Replcator.prototype.getConfig = function() {
  return config;
};

/**
 * Returns control to the read-eval-print loop after
 * being paused by an invoked option.
 */
Replcator.prototype.next = function() {
  this.runner();
};

/**
 * Clears out all repl attributes.
 */
Replcator.prototype.reset = function() {
  attributes = {};
};

/**
 * Returns the string that is rendered in the repl
 * each time input is required.
 *
 * @return {*}
 */
Replcator.prototype.getPrompt = function() {
  return prompt;
};

/**
 * Takes a string parameter that will be rendered as a prefix
 * inside of the repl each time user input is required.
 *
 * @param prompt
 */
Replcator.prototype.setPrompt = function(text) {
  prompt = text;
};

Replcator.prototype.exit = function() {
  process.stdin.destroy();
};

/**
 * Primary means of obtaining a Replcator instance.  When instantiated,
 * an option called 'exit' is automatically attached to the instance.
 * When 'exit' is provided as a string at anytime (outside of a sequence or a wizard)
 * the repl will end.
 *
 * Can be provided an option configuration object.  Valid
 * configuration values are;
 *
 *   * 'prompt' : This is a string that will be used to prefix the repl
 *      each time user input is required.  This value can be obtained and/or changed
 *      at anytime with a call to getPrompt() or setPrompt() respectively.
 *
 *   *  'start' : This is a string representing a named option that will be executed
 *      when the start() method is invoked.
 *
 *   *  'bootstrap' : A function that will invoked when start() is invoked.  This function
 *      will be passed the repl instance itself and will be executed before the repl officially
 *      begins.
 *
 *   *  'teardown' : A function that will be invoked when the repl attempts to stop - e.g., when
 *      'exit' is provided as a string to the repl.  This function will be passed as an argument,
 *      an reference to the repl instance itself.  If you provide this property, the function must
 *      terminate stdin manually by explicitly invoking repl.exit();.
 *
 * @param config
 * @return {Replcator}
 */
exports.getInstance = function(config) {

  var cfg = config || {},
      repl  = new Replcator(cfg);

  repl.on('exit', cfg.teardown || function(repl) {
    console.log('Goodbye!');
    repl.exit();
  });

  return repl;
};
