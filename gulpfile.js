'use strict';

var gulp    = require('gulp');

var helpers = require('./build/helpers');

//------------------------------------------------------------------------------
// local global vars
//------------------------------------------------------------------------------

var TASKS = ['lint', 'codestyle', 'test'];

//------------------------------------------------------------------------------
// register all sub tasks
//------------------------------------------------------------------------------
gulp.task('lint',           require('./build/lint'));
gulp.task('codestyle',      require('./build/codestyle').read);
gulp.task('codestyleFix',   require('./build/codestyle').readAndFix);
gulp.task('test',           require('./build/test').run);
gulp.task('watchTests',     require('./build/test').watchAndRun);
gulp.task('githooks',       require('./build/githooks'));

//------------------------------------------------------------------------------
// register top level tasks exposed to npm.
// 'prepush': build in serial, for easier debugging/reading of logs.
// 'default': build in parallel (gulp default), for fast build times.
//------------------------------------------------------------------------------
gulp.task('prepush', function(cb) {
    helpers.runSerial(TASKS, cb);
});

gulp.task('default', TASKS);

