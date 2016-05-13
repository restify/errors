'use strict';

// core modules
var util    = require('util');

// external modules
var WError  = require('verror').WError;

// internal files
var helpers = require('./../helpers');


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

    // normalize the signatures
    var parsed = helpers.parseVariadicArgs(arguments, true);
    var args = parsed.args;
    var options = parsed.options || {};

    // inherit from WError, call super first before doing anything else!  WError
    // will handle calling captureStackTrace, using arguments.callee to
    // eliminate unnecessary stack frames.
    WError.apply(self, args);

    /**
     * the error message.
     * since constructor can be invoked with both options.message, as well as
     * printf style messages, prefer the printf style messages that are already
     * set by WError constructor. Since we've already invoked WError constructor
     * at this point, only use options.message value if message is not yet
     * defined. in short, prefer printf messages over options.message when both
     * are passed in.
     * @property
     * @type     {String}
     */
    if (!self.message) {
        self.message = (options.message || self.message) || '';
    }

    /**
     * the http status code of the error.
     * because inherited classes have status code set on the prototype,
     * only assign a status code if truthy.
     * @property
     * @type     {Number}
     */
    if (options.statusCode) {
        self.statusCode = options.statusCode;
    }

    /**
     * property used to describe the error. emulates some of the core module
     * errors that have codes on them to describe their nature,
     * i.e., fs.readFile can return an ENOENT error where err.code is 'ENOENT'
     * @property
     * @type     {String}
     */
    if (options.code) {
        self.code = options.code;
    }

    /**
     * an object used to render the error when passed
     * to res.send()
     * @property
     * @type     {Object}
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
        code: options.code || self.code,
        message: self.message || ''
    };

    /**
     * an object of random properties that may be added to the object upon
     * instantion. useful for capturing context around a specific error.
     * @property
     * @type     {Object}
     */
    self.context = options.context || null;
}
util.inherits(HttpError, WError);

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
