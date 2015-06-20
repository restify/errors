'use strict';

var gutil = require('gulp-util');
var assert = require('assert-plus');


//------------------------------------------------------------------------------
// general helper functions
//------------------------------------------------------------------------------

/**
 * attaches a handler to the exit event of the child process,
 * exits returns an err to the callback if necessary.
 * @param   {Object}   childProc     stream object of the process
 * @param   {String}   message       an error message
 * @param   {Function} cb            gulp task callback
 * @returns {void}
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
 * returns a process stream from node_modules/.bin
 * @param   {Object} options an options object
 * @param   {Function} cb    gulp task callback
 * @returns {Object}         process stream
 */
function spawnBinary(options, cb) {
    // assert required things are here
    assert.object(options, 'options');
    assert.string(options.name, 'options.name');
    assert.optionalString(options.errorMessage, 'options.errorMessage');
    assert.optionalString(options.fileOutput, 'options.fileOutput');
    assert.func(cb, 'callback');

    var spawn = require('child_process').spawn;

    // normalize vars
    var binName = options.name;
    var binArgs = options.args || [];
    var errMsg = options.errorMessage || 'Errors found.';
    var fileOutput = options.fileOutput || '';

    // pipe all the input through parent process, so when we exit parent
    // process due to a build failure, they won't continue spewing logs
    // in the background.
    var childProc = spawn('node_modules/.bin/' + binName, binArgs);

    // stream the IO from the child process back to terminal, or possibly
    // to a file if provided (usually in the case of CI, for junit output)
    pipeIO(childProc, binName, fileOutput);

    // hook the process back up to gulp, so that an exit code from the process
    // returns a proper error message.
    handleProcessExit(childProc, errMsg, cb);

    return childProc;
}


/**
 * pipe child process stdout/stderr into current process
 * @param   {Object} childProc  a child process
 * @param   {String} binName    name of the binary
 * @param   {String} fileName   optional filename for CI
 * @returns {void}
 */
function pipeIO(childProc, binName, fileName) {
    childProc.stdout.pipe(process.stdout);
    childProc.stderr.pipe(process.stderr);
}


/**
 * builds the project in serial, only used by prepush task.
 * doesn't do anything on top of gulp other than give a pretty banner
 * for when tasks fail.
 * @param   {Array}    tasks      an array of task names to run
 * @param   {Function} cb         gulp task callback
 * @returns {void}
 */
function runSerial(tasks, cb) {
    var run = require('run-sequence');

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

    run.apply(run, tasks.concat(runComplete));
}

module.exports.spawnBinary = spawnBinary;
module.exports.runSerial = runSerial;
