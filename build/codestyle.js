'use strict';

var helpers = require('./helpers');

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
    if (helpers.isCI()) {
        codestyle(['.', '--verbose', '--colors', '--reporter', 'junit'], cb);
    } else {
        codestyle(['.', '--verbose', '--colors'], cb);
    }
};

module.exports.readAndFix = function readAndFix(cb) {
    codestyle(['.', '--fix', '--verbose', '--colors'], cb);
};
