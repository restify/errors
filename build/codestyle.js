'use strict';

var helpers = require('./helpers');
var globs   = require('./globs');


//------------------------------------------------------------------------------
// code style task
//------------------------------------------------------------------------------


/**
 * helper function for running jscs with different args.
 * mostly to separate the fix task from non fix task.
 * @param   {Array}    binArgs array of cli args
 * @param   {Function} cb      callback function
 * @returns {void}
 */
function codestyle(binArgs, cb) {
    helpers.spawnBinary({
        name: 'jscs',
        args: binArgs,
        fileOutput: 'codestyle.xml',
        errorMessage: 'Code style errors found'
    }, cb);
}


module.exports.read = function read(cb) {
    codestyle([globs.lib, globs.test, '--verbose', '--colors'], cb);
};

module.exports.readAndFix = function readAndFix(cb) {
    codestyle([globs.lib, globs.test, '--fix', '--verbose', '--colors'], cb);
};
