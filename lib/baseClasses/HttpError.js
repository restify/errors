'use strict';

// core modules
var util = require('util');

// external modules
var assert = require('assert-plus');
var nerror = require('@netflix/nerror');

// internal files
var helpers = require('./../helpers');

var WError = nerror.WError;


/**
 * Base HttpError class. inherits from WError.
 * Variadic signature, first two are special to Restify, using a options obj.
 * 1) new HttpError(anotherErr, {...});
 * 2) new HttpError({...});
 * Last one is a straight pass through to WError
 * 3) new HttpError('my special error message');
 * @public
 * @class
 */
function HttpError() {

    var self = this;
    var parsed = helpers.parseVErrorArgs(arguments);
    var verrorArgs = (parsed.verrorArgs.length !== 0) ?
        parsed.verrorArgs :
        [ self.message ];
    var opts = parsed.internalOpts;

    // if we have opts for use with restify-error's constructors, assert on them
    // now.
    assert.optionalNumber(opts.statusCode, 'opts.statusCode');
    assert.optionalFunc(opts.toJSON, 'opts.toJSON');
    assert.optionalFunc(opts.toString, 'opts.toString');

    // inherit from WError, call super first before doing anything else!  WError
    // will handle calling captureStackTrace, using arguments.callee to
    // eliminate unnecessary stack frames.
    WError.apply(self, verrorArgs);

    /**
     * the http status code of the error.
     * because inherited classes have status code set on the prototype,
     * only assign a status code if truthy.
     * @property
     * @type {Number}
     */
    if (opts.statusCode) {
        self.statusCode = opts.statusCode;
    }

    /**
     * property used to describe the error. emulates some of the core module
     * errors that have codes on them to describe their nature,
     * i.e., fs.readFile can return an ENOENT error where err.code is 'ENOENT'
     * @property
     * @type {String}
     */
    if (opts.code) {
        self.code = opts.code;
    }

    /**
     * an object used to render the error when serialized (JSON.stringify or
     * toString)
     * @property
     * @type {Object}
     */
    self.body = {
        // err.code/err.restCode is used by legacy restify paths, probably
        // originally created to emulate the code property that is created by
        // some native core module errors (i.e., a failed fs.readFile will
        // return a ENOENT error with a err.code of ENOENT).
        //
        // for Http/RestErrors, the code will be the error name but with
        // 'error' truncated from the string. i.e., if the error name is
        // InternalServerError, the code is InternalServer.
        code: opts.code || self.code,
        message: self.message || ''
    };

    /**
     * override prototype toJSON method. must use 'hasOwnProperty' to ensure we
     * are picking up a user specified option vs the one set on object literals.
     * @property
     * @type {Function}
     */
    if (opts.hasOwnProperty('toJSON')) {
        self.toJSON = opts.toJSON;
    }

    /**
     * override prototype toJSON method. must use 'hasOwnProperty' to ensure we
     * are picking up a user specified option vs the one set on object literals.
     * @property
     * @type {Function}
     */
    if (opts.hasOwnProperty('toString')) {
        self.toString = opts.toString;
    }
}
util.inherits(HttpError, WError);

/**
 * migration method to allow continued use of `.context` property that has now
 * been migrated to use VError's info object under the hood.
 * @type {Object}
 */
Object.defineProperty(HttpError.prototype, 'context', {
    get: function getContext() {
        var self = this;
        return nerror.info(self);
    }
});

/**
 * assign non-standard display name property on the CONSTRUCTOR (not prototype),
 * which is supported by all VMs. useful for stack trace output.
 * @type {String}
 */
HttpError.displayName = 'HttpError';

/**
 * the name of the error, used in the stack trace output
 * @type {String}
 */
HttpError.prototype.name = 'HttpError';

/**
 * the default error code
 * @type {String}
 */
HttpError.prototype.code = 'Error';


/**
 * implement a basic toString/JSON.stringify. they should be identical.
 * @public
 * @method toJSON
 * @returns {String}
 */
HttpError.prototype.toJSON = function toJSON() {
    var self = this;
    var message = '';

    // if we have a cause, get the full VError toString() without the current
    // error name. verbose check, self.cause can exist but returns undefined
    if (self.cause && typeof self.cause === 'function' && self.cause()) {
        var fullString = self.toString();
        message = fullString.substr(fullString.indexOf(' ') + 1);
    } else {
        message = self.body.message;
    }

    return {
        code: self.body.code,
        message: message
    };
};



module.exports = HttpError;
