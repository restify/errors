'use strict';

var util       = require('util');

var _          = require('lodash');
var assert     = require('assert-plus');

var RestError  = require('./baseClasses/RestError');
var httpErrors = require('./httpErrors');
var restErrors = require('./restErrors');



/**
 * create RestError subclasses for users. takes a string, creates a
 * constructor for them. magicks, again.
 * @public
 * @function makeError
 * @param    {String} name   the name of the error class to create
 * @param    {Number} [code] optional status code
 * @returns  {Object}
 */
function makeError(name, code) {

    assert.string(name, 'name');
    assert.optionalNumber(code, 'code');

    // dynamically create a constructor
    var ErrCtor = function() {
        // call super
        RestError.apply(this, arguments);
    };
    util.inherits(ErrCtor, RestError);
    ErrCtor.displayName = name;
    ErrCtor.prototype.name = name;
    ErrCtor.prototype.statusCode = code;

    // return the ctor
    return ErrCtor;
}




module.exports = _.assign({}, httpErrors, restErrors, {
    makeError: makeError
});

