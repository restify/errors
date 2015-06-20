'use strict';

var util       = require('util');

var _          = require('lodash');
var assert     = require('assert-plus');

var RestError  = require('./baseClasses/RestError');
var httpErrors = require('./httpErrors');
var restErrors = require('./restErrors');
var helpers    = require('./helpers');



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
        var parsed = helpers.parseVariadicArgs(arguments);
        var args = parsed.args;
        var options = parsed.options;

        // set constructor opt
        options.constructorOpt = options.constructorOpt || makeError;

        // call super
        RestError.apply(this, args);
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

