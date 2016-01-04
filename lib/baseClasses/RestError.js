'use strict';

var util      = require('util');

var HttpError = require('./HttpError');
var helpers   = require('./../helpers');


/**
 * Base RestError class. inherits from WError.
 * Variadic signature, first two are special to Restify, using a options obj.
 * 1) new RestError(anotherErr, {...});
 * 2) new RestError({...});
 * Last one is a straight pass through to WError
 * 3) new RestError('my special error message');
 * @public
 * @class
 */
function RestError() {

    var self = this;
    var parsed = helpers.parseVariadicArgs(arguments);
    var args = parsed.args;
    var options = parsed.options || {};

    // call super
    HttpError.apply(this, args);

    /**
     * a bit of a misnomer, not really an http code, but rather the name
     * of the error. the equivalent of HttpCode's `code` property.
     * TODO: Not sure why the default here is 'Error' and not 'RestError'?
     * only set the value if it doesnt already exist, as it's defined on the
     * prototype for subclasses.
     * @property
     * @type {String}
     */
    if (options.restCode) {
        self.restCode = options.restCode;
    }

    /**
     * an object used to render the error when passed
     * to res.send()
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
        code: options.restCode || self.restCode,
        message: self.message || ''
    };
}
util.inherits(RestError, HttpError);

/**
 * assign non-standard display name property on the CONSTRUCTOR (not prototype),
 * which is supported by all VMs. useful for stack trace output.
 * @type {String}
 */
RestError.displayName = 'RestError';

/**
 * the name of the error, used in the stack trace output
 * @type {String}
 */
RestError.prototype.name = 'RestError';

/**
 * the default rest code. i.e., a BadDigestError has a restCode of 'BadDigest'.
 * @type {String}
 */
RestError.prototype.restCode = 'Error';


module.exports = RestError;
