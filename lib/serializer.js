'use strict';

// external modules
var _ = require('lodash');
var verror = require('verror');
var safeJsonStringify;

// try to require optional dependency
try {
    safeJsonStringify = require('safe-json-stringify');
} catch (e) {
    safeJsonStringify = null;
}


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
        stack: (multiErr === true) ? getMultiErrorStack(err) :
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


/* jscs:disable maximumLineLength */
/**
 * serialize the error context object into a string. borrows liberally from
 * bunyan's serializer:
 * https://github.com/trentm/node-bunyan/blob/6fdc5ff20965b81ab15f8f408fe11917e06306f6/lib/bunyan.js#L865
 * @param {Object} err an error object
 * @return {String} serialized context obj
 */
/* jscs:enable maximumLineLength */
function getSerializedContext(err) {

    var hasContext = Boolean(err.context && _.keys(err.context).length > 0);
    var verrorInfo = verror.info(err);
    // verror.info can return an empty object if it doesn't have any context.
    var hasVErrorInfo = !_.isEmpty(verrorInfo);

    // if we have neither context or verror info, just return early.
    if (!hasContext && !hasVErrorInfo) {
        return '\n';
    }

    // serialize a POJO into a (key=val, key2=val2) string
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

    var ret = ' (';

    // construct context info
    if (hasContext === true) {
        ret += serializeIntoEqualString(err.context);
    }

    // construct VError info object
    if (hasVErrorInfo === true) {
        ret += serializeIntoEqualString(verrorInfo);
    }

    ret += ')\n';

    return ret;
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
