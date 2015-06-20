'use strict';


//------------------------------------------------------------
// Run Coverage
//------------------------------------------------------------

function report(callback) {

    var spawn = require('child_process').spawn;
    var catProc = spawn('cat', ['./coverage/lcov.info']);
    var coverallsProc = spawn('./node_modules/.bin/coveralls');

    catProc.stdout.pipe(coverallsProc.stdin);
    catProc.stderr.pipe(coverallsProc.stdin);
    coverallsProc.stdout.pipe(process.stdout);
    coverallsProc.stderr.pipe(process.stderr);

    coverallsProc.on('exit', function(exitCode) {
        return callback(exitCode);
    });
}

module.exports = report;

