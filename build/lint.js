'use strict';

var helpers = require('./helpers');

//------------------------------------------------------------------------------
// lint task
//------------------------------------------------------------------------------

/**
 * build task for linting
 * @param   {Function} cb      gulp task callback
 * @returns {void}
 */
function lint(cb) {

    var binArgs = (helpers.isCI() === true) ?
                    ['.', '-f', 'junit'] :
                    ['.', '--color'];

    helpers.spawnBinary({
        name: 'eslint',
        args: binArgs,
        fileOutput: 'lint.xml',
        errorMessage: 'Lint errors found.'
    }, cb);
}

module.exports = lint;
