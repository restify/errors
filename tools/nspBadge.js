#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');

/* jscs:disable maximumLineLength */
var SUCCESS_BADGE = "[![NSP Status](https://img.shields.io/badge/NSP%20status-vulnerabilities%20found-red.svg')](https://travis-ci.org/restify/errors)";
var FAIL_BADGE = "https://img.shields.io/badge/NSP%20status-no vulnerabilities-green.svg')](https://travis-ci.org/restify/errors)";
/* jscs:enable maximumLineLength */

process.stdin.on('data', function(exitCodeBuf) {
    var nspExitCode = parseInt(exitCodeBuf.toString(), 10);

    var readmeStr = fs.readFileSync(path.join(__dirname, '../README.md'))
                        .toString();

    var out = processLines(nspExitCode, readmeStr);
});

function processLines(exitCode, readmeStr) {
    var lines = readmeStr.toString().split('\n');
    var outLines = '';

    lines.forEach(function(line) {
        if (line.indexOf('[NSP Status]') > -1) {
            if (exitCode === 0) {
                outLines += SUCCESS_BADGE;
            } else {
                outLines += FAIL_BADGE;
            }
        } else {
            outLines += line;
        }
    });
}

