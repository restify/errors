'use strict';

var util       = require('util');

var _          = require('lodash');
var assert     = require('assert-plus');

var helpers    = require('./helpers');
var HttpError  = require('./baseClasses/HttpError');
var RestError  = require('./baseClasses/RestError');
var httpErrors = require('./httpErrors');
var restErrors = require('./restErrors');


/**
 * create an error object from an http status code.
 * first arg is status code, all subsequent args
 * passed on to the constructor. only works for regular
 * HttpErrors, not RestErrors.
 * @public
 * @function makeErrFromCode
 * @param    {Number} statusCode the http status code
 * @returns  {Error}             an error instance
 */
function makeErrFromCode(statusCode) {
    // assert!
    assert.number(statusCode, 'statusCode');
    assert.equal(statusCode >= 400, true);

    var args = _.rest(_.toArray(arguments));
    var name = helpers.errNameFromCode(statusCode);

    var ErrCtor = httpErrors[name];

    // assert constructor was found
    assert.func(ErrCtor);

    // pass every other arg down to constructor
    return helpers.makeInstance(ErrCtor, args);
}


/**
 * create RestError subclasses for users. takes a string, creates a
 * constructor for them. magicks, again.
 * @public
 * @function makeConstructor
 * @param    {String}   name     the name of the error class to create
 * @param    {Number}   defaults optional status code
 * @returns  {Function}          a constructor function
 */
function makeConstructor(name, defaults) {

    assert.string(name, 'name');
    assert.optionalObject(defaults, 'defaults');

    // dynamically create a constructor.
    // must be anonymous fn.
    var ErrCtor = function() {
        // call super
        RestError.apply(this, arguments);
    };
    util.inherits(ErrCtor, RestError);
    ErrCtor.displayName = name;
    ErrCtor.prototype.name = name;

    // copy over defaults
    _.assign(ErrCtor.prototype, defaults);

    // return the ctor
    return ErrCtor;
}




module.exports = _.assign({}, httpErrors, restErrors, {
    // export base classes
    HttpError: HttpError,
    RestError: RestError,

    // export convenience functions
    makeConstructor: makeConstructor,
    makeErrFromCode: makeErrFromCode,

    // deprecated method names, how long do we keep these for?
    codeToHttpError: makeErrFromCode
});

