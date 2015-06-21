'use strict';

var gutil = require('gulp-util');
var assert = require('assert-plus');


//------------------------------------------------------------------------------
// general helper functions
//------------------------------------------------------------------------------

/**
 * attaches a handler to the exit event of the child process,
 * exits returns an err to the callback if necessary.
 * @private
 * @function handleProcessExit
 * @param    {Object}   childProc      stream object of the process
 * @param    {String}   message        an error message
 * @param    {Function} cb             gulp task callback
 * @returns  {void}
 */
function handleProcessExit(childProc, message, cb) {

    childProc.on('exit', function(exitCode) {

        // check the child process exit code.
        if (exitCode) {
            return cb(new Error(message));
        }
        return cb();
    });
}


/**
 * returns a process stream
 * @public
 * @function spawn
 * @param    {Object} options an options object
 * @param    {Function} cb    gulp task callback
 * @returns  {Stream}         process stream
 */
function spawnBinary(options, cb) {

    // assert required things are here
    assert.object(options, 'options');
    assert.arrayOfString(options.cmd, 'options.cmd');
    assert.func(cb, 'callback');
    assert.optionalString(options.errorMessage, 'options.errorMessage');
    assert.optionalBool(options.nodeBinary, 'options.nodeBinary');

    var spawn = require('child_process').spawn;

    // normalize vars
    var binName = options.cmd.shift();
    var binArgs = options.cmd; // assign remaining params as args
    var downstreamProc = options.downstream;
    var errMsg = options.errorMessage || 'Errors found.';

    // depending on if downstream was passed in, decide whether or not to
    // create the process with stdio set to pipe (default) or back to the
    // process's io (inherit)
    var childProc = spawn(binName,
                            binArgs,
                            {
                                stdio: downstreamProc ? 'pipe' : 'inherit'
                            });

    // if we have downstreamProc, pipe it in now.
    if (downstreamProc) {
        childProc.stdout.pipe(downstreamProc.stdin);
        childProc.stderr.pipe(downstreamProc.stdin);
    }

    // hook the process back up to gulp, so that an exit code from the process
    // returns a proper error message.
    handleProcessExit(childProc, errMsg, cb);

    return childProc;
}


/**
 * returns a process stream from node_modules/.bin
 * @public
 * @function spawnNodeBinary
 * @param    {Object}   options an options object
 * @param    {Function} cb      gulp task callback
 * @returns  {Stream}           process stream
 */
function spawnNodeBinary(options, cb) {
    // assert required things are here
    assert.object(options, 'options');
    assert.arrayOfString(options.cmd, 'options.cmd');
    assert.func(cb, 'callback');
    assert.optionalString(options.errorMessage, 'options.errorMessage');

    // prepend bin path with node_modules
    options.cmd[0] = 'node_modules/.bin/' + options.cmd[0];

    return spawnBinary(options, cb);
}


/**
 * builds the project in serial, only used by prepush task.
 * doesn't do anything on top of gulp other than give a pretty banner
 * for when tasks fail.
 * @public
 * @function runSerial
 * @param    {Array}    tasks      an array of task names to run
 * @param    {Function} cb         gulp task callback
 * @returns  {void}
 */
function runSerial(tasks, cb) {

    var runSequence = require('run-sequence');

    // run-sequence calls the complete callback on the FIRST task error
    // it encounters. that means we can only log errors on the first error
    // caught, even if other parallel tasks are causing errors too.
    // make sure this is clear from looking at cli output.
    function runComplete(err) {

        var color,
            msgHeader;

        if (err) {
            msgHeader = 'BUILD FAILURE';
            color = gutil.colors.red;
        } else {
            msgHeader = 'BUILD SUCCESS';
            color = gutil.colors.green;
        }

        // jscs:disable maximumLineLength
        // these banner lines are exactly 80 chars.
        // start output message
        gutil.log(color(
            '---------------------------------------------------------------------------------'
        ));
        gutil.log(color(msgHeader));

        // if error occurred, log additional debug info
        if (err) {
            var failedTask = err.task;

            gutil.log();
            gutil.log(color('Errors found in the following task:'));
            gutil.log(color('• ' + '\'' + failedTask + '\''));
            gutil.log();
            gutil.log(color('Errors may exist in other tasks, please fix before proceeding!'));
        }

        // finish output message
        gutil.log(color(
            '---------------------------------------------------------------------------------'
        ));
        // jscs:enable maximumLineLength

        // call cb to finish out the gulp task runner
        return cb(err ? new Error('Build failure.') : null);
    }

    runSequence.apply(runSequence, tasks.concat(runComplete));
}


module.exports.spawnNodeBinary = spawnNodeBinary;
module.exports.spawn = spawnBinary;
module.exports.runSerial = runSerial;
