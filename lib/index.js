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

    // code property doesn't have 'Error' in it. remove it.
    var defaultCode = name.replace(new RegExp('[Ee]rror$'), '');
    var d = _.assign({}, {
        name: name,
        code: (defaults && defaults.code) || defaultCode,
        restCode: _.get(defaults, 'restCode', defaultCode)
    }, defaults);

    // assert that this constructor doesn't already exist.
    assert.equal(typeof module.exports[name], 'undefined',
                 'Constructor already exists!');

    // dynamically create a constructor.
    // must be anonymous fn.
    var ErrCtor = function() {
        // call super
        RestError.apply(this, arguments);
    };
    util.inherits(ErrCtor, RestError);

    // copy over all options to prototype
    _.assign(ErrCtor.prototype, d);

    // assign display name
    ErrCtor.displayName = name;

    // store constructor on main exports
    module.exports[name] = ErrCtor;
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
    function F() {
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




/**
 * built in bunyan serializer for restify errors. it's more or less the
 * standard bunyan serializer with support for the context property. borrows
 * liberally from:
 * https://github.com/trentm/node-bunyan/blob/master/lib/bunyan.js
 * @public
 * @function serializer
 * @param {Object} err an error object
 * @returns {Object} serialized object for bunyan output
 */
function serializer(err) {

    if (!err || !err.stack) {
        return err;
    }

    function getSerializedContext(ex) {

        var ret = '';

        if (ex.context && _.keys(ex.context).length > -1) {
            ret += ' (';
            _.forEach(ex.context, function(val, key) {
                ret += key + '=' + val.toString() + ', ';
            });
            // remove last comma
            ret = ret.slice(0, -2);
            ret += ')';
        }

        return ret + '\n';
    }

    function getFullErrorStack(ex) {
        var e = ex;
        var out = '';
        var first = true;

        do {
            if (first !== true) {
                out += '\nCaused by: ';
            }

            // parse out first new line of stack trace, append context
            // there.
            var stackString = (e.stack || e.toString()).split('\n');

            out += stackString.shift() + getSerializedContext(e);
            out += stackString.join('\n');
            e = (e.cause) ? e.cause() : null;
            first = false;
        } while (e);

        // remove last new line char
        out = out.slice(0, -2);

        return out;
    }

    return {
        message: err.message,
        name: err.name,
        stack: getFullErrorStack(err),
        code: err.code,
        signal: err.signal
    };
}



module.exports = _.assign({}, httpErrors, restErrors, {
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
    bunyanSerializer: serializer
});

