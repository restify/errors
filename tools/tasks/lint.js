'use strict';

var helpers = require('./helpers');
var globs   = require('./../globs');

//------------------------------------------------------------------------------
// lint task
//------------------------------------------------------------------------------

/**
 * build task for linting
 * @param   {Function} cb      gulp task callback
 * @returns {void}
 */
function lint(cb) {

    helpers.spawnNodeBinary({
        cmd: ['eslint', globs.lib, globs.test, '--color']
    }, cb);
}

module.exports = lint;
