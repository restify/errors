'use strict';

var util      = require('util');

var HttpError = require('./HttpError');
var helpers   = require('./helpers');


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
    var options = parsed.options;

    // add constructorOpt to clean up stack trace
    options.constructorOpt = options.constructorOpt || RestError;

    // call super
    HttpError.apply(this, args);

    /**
     * the error message.
     * when message isn't passed in with options, expect WError constructor
     * to fill in the message for us with the passed through args,
     * usually via sprintf or just straight strings.
     * @property
     * @type {String}
     */
    self.message = (options.message || self.message) || '';

    /**
     * a bit of a misnomer, not really an http code, but rather the name
     * of the error. the equivalent of HttpCode's `code` property.
     * TODO: Not sure why the default here is 'Error' and not 'RestError'?
     * only set the value if it doesnt already exist, as it's defined on the
     * prototype for subclasses.
     * @property
     * @type {String}
     */
    self.restCode = (options.restCode || self.restCode) || 'Error';

    /**
     * an object used to render the error when passed
     * to res.send()
     * @property
     * @type {Object}
     */
    self.body = {
        // this is a bit unintuitive, but code actually refers to the name
        // of the error, and not the http statusCode.
        code: self.restCode,
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



module.exports = RestError;

