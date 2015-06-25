'use strict';

var gulp    = require('gulp');

var helpers = require('./tools/tasks/helpers');

//------------------------------------------------------------------------------
// local global vars
//------------------------------------------------------------------------------

var TASKS = ['lint', 'codestyle', 'test'];

//------------------------------------------------------------------------------
// register all sub tasks
//------------------------------------------------------------------------------
gulp.task('lint',           require('./tools/tasks/lint'));
gulp.task('codestyle',      require('./tools/tasks/codestyle').read);
gulp.task('codestyleFix',   require('./tools/tasks/codestyle').readAndFix);
gulp.task('test',           require('./tools/tasks/test').run);
gulp.task('watchTests',     require('./tools/tasks/test').watchAndRun);
gulp.task('githooks',       require('./tools/tasks/githooks'));

//------------------------------------------------------------------------------
// register top level tasks exposed to npm.
// 'prepush': build in serial, for easier debugging/reading of logs.
// 'default': build in parallel (gulp default), for fast build times.
//------------------------------------------------------------------------------
gulp.task('prepush', function(cb) {
    helpers.runSerial(TASKS, cb);
});

gulp.task('default', TASKS);

