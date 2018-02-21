'use strict';

// core modules
var http = require('http');

// external modules
var _ = require('lodash');
var assert = require('assert-plus');

// local globals
var INTERNAL_OPTS_KEYS = {
    'code': true,
    'restCode': true,
    'statusCode': true,
    'toJSON': true,
    'toString': true
};


//------------------------------------------------------------------------------
// constructor arg parsers
//------------------------------------------------------------------------------

/**
 * helper function for parsing all of the Error constructor variadic sigs.
 * these signatures are all derived from VError.
 * 1) new HttpError(sprintf_args...);
 * 2) new HttpError(anotherErr, sprintf_args);
 * 3) new HttpError({...}, sprintf_args);
 * restify-errors' value is to add support for additional options using the
 * signature #3. this function parses out the arguments specific to
 * restify-errors so that they don't get passed on to VError.
 * @public
 * @param {Object} ctorArgs an 'arguments' object
 * @function parseVErrorArgs
 * @returns {Object}
 */
function parseVErrorArgs(ctorArgs) {
    // to array the inner arguments so it's easier to determine which cases
    // we are looking at
    var args = _.toArray(ctorArgs);
    var internalOpts = {};
    var verrorOpts = {};
    var verrorArgs;

    if (_.isPlainObject(args[0])) {
        // split restify-errors options from verror options
        _.forOwn(args[0], function(val, key) {
            if (INTERNAL_OPTS_KEYS.hasOwnProperty(key)) {
                internalOpts[key] = val;
            } else {
                verrorOpts[key] = val;
            }
        });

        // reconstruct verror ctor options from the cleaned up options
        verrorArgs = [ verrorOpts ].concat(_.tail(args));
    } else {
        verrorArgs = args;
    }

    return {
        // raw arguments to pass to VError constructor
        verrorArgs: verrorArgs,
        // restify-errors specific options
        internalOpts: internalOpts
    };
}


//------------------------------------------------------------------------------
// helpers
//------------------------------------------------------------------------------


/**
 * create an error name from a status code. looks up the description via
 * http.STATUS_CODES, then calls createErrNameFromDesc().
 * @private
 * @function errNameFromCode
 * @param {Number} code an http status code
 * @returns {String}
 */
function errNameFromCode(code) {

    assert.number(code, 'code');

    // attempt to retrieve status code description, if not available,
    // fallback on 500.
    var errorDesc = http.STATUS_CODES[code] || http.STATUS_CODES[500];
    return errNameFromDesc(errorDesc);
}


/**
 * used to programatically create http error code names, using the underlying
 * status codes names exposed via the http module.
 * @private
 * @function errNameFromDesc
 * @param {String} desc a description of the error, e.g., 'Not Found'
 * @returns {String}
 */
function errNameFromDesc(desc) {

    assert.string(desc, 'desc');

    // takes an error description, split on spaces, camel case it correctly,
    // then append 'Error' at the end of it.
    // e.g., the passed in description is 'Internal Server Error'
    //       the output is 'InternalServerError'
    var pieces = desc.split(/\s+/);
    var name = _.reduce(pieces, function(acc, piece) {
        // lowercase all, then capitalize it.
        var normalizedPiece = _.capitalize(piece.toLowerCase());
        return acc + normalizedPiece;
    }, '');

    // strip all non word characters
    name = name.replace(/\W+/g, '');

    // append 'Error' at the end of it only if it doesn't already end with it.
    if (!_.endsWith(name, 'Error')) {
        name += 'Error';
    }

    return name;
}



module.exports = {
    errNameFromCode: errNameFromCode,
    errNameFromDesc: errNameFromDesc,
    parseVErrorArgs: parseVErrorArgs
};
