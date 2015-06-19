'use strict';

var gulp = require('gulp');
var helpers = require('./helpers');

//------------------------------------------------------------------------------
// Run Mocha Tests
//------------------------------------------------------------------------------

/**
 * build task for running tests
 * @param   {Function} cb      gulp task callback
 * @returns {void}
 */
function run(cb) {

    var binArgs = (helpers.isCI() === true) ?
                    ['-R', 'xunit', '--recursive', 'test/'] :
                    ['-R', 'spec', '--colors'];

    helpers.spawnBinary({
        name: 'mocha',
        args: binArgs,
        fileOutput: 'test.xml',
        errorMessage: 'Unit test errors found'
    }, cb);
}

//------------------------------------------------------------------------------
// watch the test folder, re-run tests on any changes
//------------------------------------------------------------------------------
function watchAndRun() {
    gulp.watch('test/**/*.js', ['test']);
}


module.exports.run = run;
module.exports.watchAndRun = watchAndRun;
