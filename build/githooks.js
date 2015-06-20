'use strict';

var gulp = require('gulp');

//------------------------------------------------------------------------------
// Install git precommit hooks
//------------------------------------------------------------------------------

function githooks() {
    var symlink = require('gulp-symlink');

    return gulp.src('./pre-push')
                .pipe(symlink('.git/hooks/pre-push', { force: true }));
}

module.exports = githooks;
