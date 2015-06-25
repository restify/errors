'use strict';

var fs = require('fs');
var path = require('path');

var gutil = require('gulp-util');
var vasync = require('vasync');

//------------------------------------------------------------------------------
// Install git precommit hooks
//------------------------------------------------------------------------------

function githooks(callback) {

    // this whole task is a bit silly, and should be accomplished via
    // ln -s tools/githooks/* .git/hooks/
    // however, child_process.spawn bypasses the shell so it can't expand
    // wildcards. instead, programatically loop through all git hooks and
    // symlink them.
    fs.readdir('./tools/githooks', function readdirComplete(readErr, files) {
        if (readErr) {
            return callback(readErr);
        }

        // determine relative pathing
        var relPath = path.relative('.git/hooks', './tools/githooks');

        vasync.forEachParallel({
            func: function symlink(item, innerCb) {
                var srcPath = path.join(relPath, item);
                var destPath = path.resolve('.git/hooks', item);

                // force delete any existing dest files.
                fs.unlink(destPath, function() {
                    // deletion may error if file doesn't exist, that's okay,
                    // ignore it. now symlink it
                    fs.symlink(srcPath, destPath, function(symlinkErr) {
                        // log on success
                        if (symlinkErr) {
                            return innerCb(symlinkErr);
                        }

                        gutil.log('successfully symlinked', item);
                        return innerCb();
                    });
                });
            },
            inputs: files
        }, callback);
    });
}

module.exports = githooks;
