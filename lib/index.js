// Copyright 2012 Mark Cavage, Inc.  All rights reserved.

'use strict';

var _          = require('lodash');
var assert     = require('assert-plus');
var httpErrors = require('./httpErrors');
var restErrors = require('./restErrors');
var helpers    = require('./helpers');

var allErrors  = _.assign({}, httpErrors, restErrors);

/**
 * create an error object from an http status code.
 * first arg is status code, all subsequent args
 * passed on to the constructor.
 * @public
 * @function errFromCode
 * @param    {Number} code    the http status code
 * @returns  {Object}         an error instance
 */
function errFromCode(code) {
    // assert!
    assert.number(code, 'code');
    assert.equal(code >= 400, true);

    var args = _.rest(_.toArray(arguments));

    var name = helpers.errNameFromCode(code);
    var ErrCtor = allErrors[name];

    // pass every other arg down to constructor
    return construct(ErrCtor, args);
}


/**
 * helper function to dynamically apply args
 * to a dynamic constructor. magicks.
 * @private
 * @function construct
 * @param    {Function} constructor the constructor function
 * @param    {Array}    args        array of arguments to apply to ctor
 * @returns  {Object}               instance of the ctor
 */
function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}



module.exports = _.assign({}, allErrors, {
    errFromCode: errFromCode
});

