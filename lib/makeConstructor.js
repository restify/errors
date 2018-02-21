'use strict';

// core modules
var util = require('util');

// external modules
var _ = require('lodash');
var assert = require('assert-plus');

// local files
var RestError = require('./baseClasses/RestError');



/**
 * create RestError subclasses for users. takes a string, creates a
 * constructor for them. magicks, again.
 * @public
 * @function makeConstructor
 * @param {String} name the name of the error class to create
 * @param {Number} defaults optional status code
 * @return {Function} a constructor function
 */
function makeConstructor(name, defaults) {

    assert.string(name, 'name');
    assert.optionalObject(defaults, 'defaults');

    // code property doesn't have 'Error' in it. remove it.
    var defaultCode = name.replace(new RegExp('[Ee]rror$'), '');
    var prototypeDefaults = _.assign({}, {
        name: name,
        code: (defaults && defaults.code) || defaultCode,
        restCode: _.get(defaults, 'restCode', defaultCode)
    }, defaults);

    // assert that this constructor doesn't already exist.
    assert.equal(
        typeof module.exports[name],
        'undefined',
        'Constructor already exists!'
    );

    // dynamically create a constructor.
    // must be anonymous fn.
    var ErrCtor = function() { // eslint-disable-line require-jsdoc, func-style
        // call super
        RestError.apply(this, arguments);
        this.name = name;
    };
    util.inherits(ErrCtor, RestError);

    // copy over all options to prototype
    _.assign(ErrCtor.prototype, prototypeDefaults);

    // assign display name
    ErrCtor.displayName = name;

    // return constructor to user, they can choose how to store and manage it.
    return ErrCtor;
}


module.exports = makeConstructor;
