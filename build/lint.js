'use strict';

var helpers = require('./helpers');
var globs   = require('./globs');

//------------------------------------------------------------------------------
// lint task
//------------------------------------------------------------------------------

/**
 * build task for linting
 * @param   {Function} cb      gulp task callback
 * @returns {void}
 */
function lint(cb) {

    helpers.spawnBinary({
        name: 'eslint',
        args: [globs.lib, globs.test, '--color'],
        fileOutput: 'lint.xml',
        errorMessage: 'Lint errors found.'
    }, cb);
}

module.exports = lint;
