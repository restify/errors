'use strict';

// external modules
var assert = require('assert-plus');
var _ = require('lodash');
var nerror = require('@netflix/nerror');
var domain = require('domain');
var MultiError = nerror.MultiError;
var VError = nerror.VError;
var safeJsonStringify;

// try to require optional dependency
try {
    // eslint-disable-next-line global-require
    safeJsonStringify = require('safe-json-stringify');
} catch (e) {
    safeJsonStringify = null;
}


/**
 * @class ErrorSerializer
 * @param {Object} opts an options object
 */
function ErrorSerializer(opts) {
    assert.object(opts, 'opts');
    assert.bool(opts.topLevelFields, 'opts.topLevelFields');

    /**
     * when true, serialize all top level fields found on the Error object
     * @type {Bool}
     */
    this._serializeTopLevelFields = opts.topLevelFields;

    /**
     * find known fields we don't want to serialize
     * @type {Array}
     */
    this._knownFields = this._findKnownFields();
}


/**
 * loop through all errors() in a MultiError and build a stack trace
 * output.
 * @private
 * @method _getMultiErrorStack
 * @param {Object} err an error object
 * @returns {String} stack trace string
 */
ErrorSerializer.prototype._getMultiErrorStack =
function _getMultiErrorStack(err) {

    var self = this;
    var out = '';

    _.forEach(err.errors(), function(e, idx, errs) {
        out += 'MultiError ' + (idx + 1) + ' of ' + errs.length + ': ';
        out += self._getFullErrorStack(e) + '\n';
    });

    // remove last new line char
    out = out.slice(0, -1);

    return out;
};


/**
 * loop through all cause() errors and build a stack trace output
 * @private
 * @method _getFullErrorStack
 * @param {Object} err an error object
 * @returns {String} stack trace string
 */
ErrorSerializer.prototype._getFullErrorStack =
function _getFullErrorStack(err) {
    var self = this;
    var e = err;
    var out = '';
    var first = true;

    do {
        if (first !== true) {
            out += '\nCaused by: ';
        }

        // parse out first new line of stack trace, append context there.
        var stackString = (e.stack || e.toString()).split('\n');

        out += stackString.shift() + self._getSerializedContext(e);
        out += stackString.join('\n');
        e = (typeof e.cause === 'function') ? e.cause() : null;
        first = false;
    } while (e);

    return out;
};


/* eslint-disable max-len */
/* jscs:disable maximumLineLength */
/**
 * serialize the error context object into a string. borrows liberally from
 * bunyan's serializer:
 * https://github.com/trentm/node-bunyan/blob/6fdc5ff20965b81ab15f8f408fe11917e06306f6/lib/bunyan.js#L865
 * @private
 * @method _getSerializedContext
 * @param {Object} err an error object
 * @return {String} serialized context obj
 */
/* jscs:enable maximumLineLength */
/* eslint-enable max-len */
ErrorSerializer.prototype._getSerializedContext =
function _getSerializedContext(err) {

    /**
     * serialize a POJO into a string of the format:
     *     (key="valString", key2=valInteger, key3={a:valPojo})
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

    var self = this;
    var ret = '';

    // look for error context in 3 places, in ascending order of precedence:
    // 1) raw fields on the error object that are not known verror or
    // restify-error fields
    // 2) restify-error context fields (restify-errors@ <= 5.x)
    // 3) verror info field
    var topLevelFields = (self._serializeTopLevelFields === true) ?
        _.omit(err, self._knownFields) :
        {};

    if (topLevelFields.domain instanceof domain.Domain) {
        topLevelFields = _.omit(topLevelFields, [ 'domain' ]);
    }

    // combine all fields into a pojo, and serialize
    var allFields = _.assign({}, topLevelFields, err.context, nerror.info(err));

    if (!_.isEmpty(allFields)) {
        ret = ' (' + serializeIntoEqualString(allFields) + ')';
    }

    return ret + '\n';
};


/**
 * find a list of known error fields that we don't want to serialize. create
 * verror instances to programatically build that list.
 * @private
 * @method _findKnownFields
 * @return {Array}
 */
ErrorSerializer.prototype._findKnownFields = function _findKnownFields() {
    // when looping through arbitrary fields attached to the error object, cross
    // reference them against this known list of fields.
    var fields = [
        // known Error fields
        'message',
        'name',
        'toJSON',
        // known restify-error fields
        'toString',
        'body'
    ];

    // make a verror and multierror and find expected fields
    var verr = new VError();
    var multiErr = new MultiError([ verr ]);
    fields.push(_.keys(verr));
    fields.push(_.keys(Object.getPrototypeOf(verr)));
    fields.push(_.keys(multiErr));
    fields.push(_.keys(Object.getPrototypeOf(multiErr)));

    return _(fields).flatten().uniq().value();
};


/**
 * built in bunyan serializer for restify errors. it's more or less the
 * standard bunyan serializer with support for the context property.
 * @private
 * @method serialize
 * @param {Object} err an error object
 * @returns {Object} serialized object for bunyan output
 */
ErrorSerializer.prototype.serialize = function serialize(err) {
    if (!err || !err.stack) {
        return err;
    }

    var self = this;
    var multiErr = (err.errors && _.isFunction(err.errors));

    return {
        message: err.message,
        name: err.name,
        stack: (multiErr === true) ?
            self._getMultiErrorStack(err) :
            self._getFullErrorStack(err),
        code: err.code,
        signal: err.signal
    };
};


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


/**
 * factory function to create customized serializers.
 * @public
 * @param {Object} options an options object
 * @return {Function} serializer function
 */
function factory(options) {
    assert.optionalObject(options, 'options');

    var opts = _.assign({
        topLevelFields: false
    }, options);

    var serializer = new ErrorSerializer(opts);
    // rebind the serialize function since this will be lost when we export it
    // as a POJO
    serializer.serialize = serializer.serialize.bind(serializer);

    return serializer;
}


// we should be exporting this create function, but to refrain from making it a
// breaking change, let's attach the create to the existing function export. we
// can make the change in next major version.
var defaultSerializer = factory();
defaultSerializer.serialize.create = function create(opts) {
    var serializer = factory(opts);
    return {
        err: serializer.serialize
    };
};


module.exports = defaultSerializer.serialize;
