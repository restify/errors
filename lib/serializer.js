'use strict';

// external modules
var _ = require('lodash');
var verror = require('verror');
var safeJsonStringify;

// try to require optional dependency
try {
    // eslint-disable-next-line global-require
    safeJsonStringify = require('safe-json-stringify');
} catch (e) {
    safeJsonStringify = null;
}

// when looping through arbitrary fields attached to the error object, cross
// reference them against this known list of fields.
var KNOWN_FIELDS = [
    // known verror fields
    'ase_errors',
    'jse_shortmsg',
    'jse_cause',
    'jse_info',
    'cause',
    // known Error fields
    'message',
    'name',
    'toJSON',
    // known restify-error fields
    'toString',
    'body'
];


/**
 * built in bunyan serializer for restify errors. it's more or less the
 * standard bunyan serializer with support for the context property.
 * @public
 * @function serializer
 * @param {Object} err an error object
 * @returns {Object} serialized object for bunyan output
 */
function serializer(err) {

    if (!err || !err.stack) {
        return err;
    }

    var multiErr = (err.errors && _.isFunction(err.errors));

    return {
        message: err.message,
        name: err.name,
        stack: (multiErr === true) ?
            getMultiErrorStack(err) :
            getFullErrorStack(err),
        code: err.code,
        signal: err.signal
    };
}


/**
 * loop through all errors() in a verror.MultiError and build a stack trace
 * output.
 * @param {Object} err an error object
 * @returns {String} stack trace string
 */
function getMultiErrorStack(err) {

    var out = '';

    _.forEach(err.errors(), function(e, idx, errs) {
        out += 'MultiError ' + (idx + 1) + ' of ' + errs.length + ': ';
        out += getFullErrorStack(e) + '\n';
    });

    // remove last new line char
    out = out.slice(0, -1);

    return out;
}


/**
 * loop through all cause() errors and build a stack trace output
 * @param {Object} err an error object
 * @returns {String} stack trace string
 */
function getFullErrorStack(err) {
    var e = err;
    var out = '';
    var first = true;

    do {
        if (first !== true) {
            out += '\nCaused by: ';
        }

        // parse out first new line of stack trace, append context there.
        var stackString = (e.stack || e.toString()).split('\n');

        out += stackString.shift() + getSerializedContext(e);
        out += stackString.join('\n');
        e = (typeof e.cause === 'function') ? e.cause() : null;
        first = false;
    } while (e);

    return out;
}


/* eslint-disable max-len */
/**
 * serialize the error context object into a string. borrows liberally from
 * bunyan's serializer:
 * https://github.com/trentm/node-bunyan/blob/6fdc5ff20965b81ab15f8f408fe11917e06306f6/lib/bunyan.js#L865
 * @param {Object} err an error object
 * @return {String} serialized context obj
 */
function getSerializedContext(err) {
/* eslint-enable max-len */

    /**
     * serialize a POJO into a string of the format:
     *     (key=val, key2=val2)
     * @param {Object} obj a POJO to serialize
     * @return {String}
     */
    function serializeIntoEqualString(obj) {

        var out = '';

        _.forEach(obj, function(val, key) {
            var stringVal;

            try {
                stringVal = JSON.stringify(val, safeCycles());
            } catch (e) {
                if (safeJsonStringify) {
                    stringVal = safeJsonStringify(val);
                } else {
                    stringVal = 'unserializable! you can install ' +
                                '"safe-json"stringify" module for safer ' +
                                'stringification';
                }
            }

            out += key + '=' + stringVal + ', ';
        });
        // remove last comma
        return out.slice(0, -2);
    }

    var ret = '';

    // look for error context in 3 places, in ascending order of precedence:
    // 1) raw fields on the error object that are not known verror or
    // restify-error fields
    // 2) restify-error context fields (restify-errors@ <= 5.x)
    // 3) verror info field
    var rawFields = _.omit(err, KNOWN_FIELDS);

    // combine all fields into a pojo, and serialize
    var allFields = _.assign({}, rawFields, err.context, verror.info(err));

    if (!_.isEmpty(allFields)) {
        ret = ' (' + serializeIntoEqualString(rawFields) + ')';
    }

    return ret + '\n';
}


/**
 * copy pasta-ed from bunyan.
 * A JSON stringifier that handles cycles safely.
 * Usage: JSON.stringify(obj, safeCycles())
 * @returns {Function}
 */
function safeCycles() {

    var seen = [];

    return function(key, val) {
        if (!val || typeof (val) !== 'object') {
            return val;
        }

        if (seen.indexOf(val) !== -1) {
            return '[Circular]';
        }
        seen.push(val);
        return val;
    };
}



module.exports = serializer;
