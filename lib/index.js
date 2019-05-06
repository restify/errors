'use strict';

var _ = require('lodash');
var assert = require('assert-plus');
var nerror = require('@netflix/nerror');

var bunyanSerializer = require('./serializer');
var helpers = require('./helpers');
var HttpError = require('./baseClasses/HttpError');
var RestError = require('./baseClasses/RestError');
var httpErrors = require('./httpErrors');
var restErrors = require('./restErrors');
var makeConstructor = require('./makeConstructor');


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

    // drop the first arg
    var args = _.drop(_.toArray(arguments));
    var name = helpers.errNameFromCode(statusCode);

    var ErrCtor = httpErrors[name];

    // assert constructor was found
    assert.func(ErrCtor);

    // pass every other arg down to constructor
    return makeInstance(ErrCtor, makeErrFromCode, args);
}


/**
 * helper function to dynamically apply args
 * to a dynamic constructor. magicks.
 * @private
 * @function makeInstance
 * @param    {Function} constructor    the constructor function
 * @param    {Function} constructorOpt where to start the error stack trace
 * @param    {Array}    args           array of arguments to apply to ctor
 * @returns  {Object}                  instance of the ctor
 */
function makeInstance(constructor, constructorOpt, args) {
    // pass args to the constructor
    function F() { // eslint-disable-line require-jsdoc
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;

    // new up an instance, and capture stack trace from the
    // passed in constructorOpt
    var errInstance = new F();
    Error.captureStackTrace(errInstance, constructorOpt);

    // return the error instance
    return errInstance;
}



module.exports = _.assign({}, httpErrors, restErrors, nerror, {
    // export base classes
    HttpError: HttpError,
    RestError: RestError,

    // export convenience functions
    makeConstructor: makeConstructor,
    makeErrFromCode: makeErrFromCode,

    // deprecated method names, how long do we keep these for?
    // restify has already been updated, but what about external consumers?
    codeToHttpError: makeErrFromCode,

    // built in bunyan serializer
    bunyanSerializer: bunyanSerializer
});
