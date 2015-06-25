// jscs:disable maximumLineLength

'use strict';


// core modules
var http          = require('http');

// userland
var assert        = require('chai').assert;
var _             = require('lodash');
var WError        = require('verror').WError;

// internal
var helpers       = require('../lib/helpers');
var HttpError     = require('../lib/baseClasses/HttpError');
var RestError     = require('../lib/baseClasses/RestError');
var httpErrors    = require('../lib/httpErrors');
var restErrors    = require('../lib/restErrors');
var restifyErrors = require('../lib/index.js');


describe('restify-errors node module.', function() {

    describe('HttpError class', function() {

        it('should create generic HttpError, inheriting from WError', function() {
            var myErr = new HttpError();

            assert.equal(myErr instanceof HttpError, true);
            assert.equal(myErr instanceof WError, true);
            assert.equal(myErr instanceof Error, true);
        });

        it('should create HttpError using options object', function() {
            var options = {
                message: 'my http error',
                statusCode: 799
            };
            var myErr = new HttpError(options);

            // verify properties on the error
            assert.equal(myErr.name, 'HttpError');
            assert.equal(myErr.message, options.message);
            assert.equal(myErr.statusCode, options.statusCode);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, options.message);
            assert.equal(myErr.body.code, 'HttpError');
        });

        it('should create HttpError, and retain a prior cause', function() {
            // create http error with prior cause
            var priorErr = new Error('foobar');
            var myErr = new HttpError(priorErr, 'new message');

            assert.equal(myErr.we_cause, priorErr);
            assert.equal(myErr.name, 'HttpError');
            assert.equal(myErr.message, 'new message');
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, 'new message');
            assert.equal(myErr.body.code, 'HttpError');

            // create http error with prior cause and options
            var myErr2Msg = 'bazbar';
            var myErr2 = new HttpError(priorErr, {
                message: myErr2Msg
            });

            assert.equal(myErr2.we_cause, priorErr);
            assert.equal(myErr2.name, 'HttpError');
            assert.equal(myErr2.message, myErr2Msg);
            assert.isObject(myErr2.body);
            assert.equal(myErr2.body.message, myErr2Msg);
            assert.equal(myErr2.body.code, 'HttpError');
        });

        it('should create HttpError, args should fall through to WError', function() {
            var myErr = new HttpError('missing file: "%s"', 'foobar');

            assert.equal(myErr.message, 'missing file: "foobar"');
        });
    });

    describe('Built-in HttpError subclasses', function() {

        it('should create BadGatewayError, inheriting from HttpError from WError', function() {
            var myErr = new httpErrors.BadGatewayError();

            assert.equal(myErr instanceof httpErrors.BadGatewayError, true);
            assert.equal(myErr instanceof HttpError, true);
            assert.equal(myErr instanceof WError, true);
            assert.equal(myErr instanceof Error, true);

            // assert default status code
            assert.equal(myErr.statusCode, 502);
            assert.equal(myErr.message, '');
        });

        it('should create BadGatewayError using options object', function() {
            var msg = 'my http error';
            var myErr = new httpErrors.BadGatewayError({
                message: msg,
                statusCode: 799  // can pass in any crazy status code
            });

            assert.equal(myErr.name, 'BadGatewayError');
            assert.equal(myErr.message, msg);
            assert.equal(myErr.statusCode, 799);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, msg);
            assert.equal(myErr.body.code, 'BadGatewayError');
        });

        it('should create BadGatewayError, and retain a prior cause', function() {
            var priorErr = new Error('foobar');
            var myErr = new httpErrors.BadGatewayError(priorErr);

            assert.equal(myErr.we_cause, priorErr);
            assert.equal(myErr.name, 'BadGatewayError');
            assert.equal(myErr.statusCode, 502);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, '');
            assert.equal(myErr.body.code, 'BadGatewayError');

            var myErr2Msg = 'bazbar';
            var myErr2 = new httpErrors.BadGatewayError(priorErr, {
                message: myErr2Msg
            });

            assert.equal(myErr.we_cause, priorErr);
            assert.equal(myErr.name, 'BadGatewayError');
            assert.equal(myErr.statusCode, 502);
            assert.equal(myErr2.message, myErr2Msg);
            assert.isObject(myErr2.body);
            assert.equal(myErr2.body.message, myErr2Msg);
            assert.equal(myErr2.body.code, 'BadGatewayError');
        });

        it('should create BadGatewayError, args should fall through to WError', function() {
            var myErr = new httpErrors.BadGatewayError('missing file: "%s"', 'foobar');

            assert.equal(myErr.message, 'missing file: "foobar"');
        });
    });

    describe('RestError class', function() {
        it('should create generic RestError, inheriting from WError', function() {
            var myErr = new RestError();

            assert.equal(myErr instanceof RestError, true);
            assert.equal(myErr instanceof WError, true);
            assert.equal(myErr instanceof Error, true);
        });

        it('should create RestError, using options object', function() {
            var options = {
                message: 'my http error',
                statusCode: 799
            };
            var myErr = new RestError(options);

            // verify properties on the error
            assert.equal(myErr.name, 'RestError');
            assert.equal(myErr.restCode, 'Error');
            assert.equal(myErr.message, options.message);
            assert.equal(myErr.statusCode, options.statusCode);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, options.message);
            assert.equal(myErr.body.code, 'Error');
        });

        it('should create RestError, and retain a prior cause', function() {
            // create http error with prior cause
            var priorErr = new Error('foobar');
            var myErr = new RestError(priorErr);

            assert.equal(myErr.we_cause, priorErr);
            assert.equal(myErr.name, 'RestError');
            assert.equal(myErr.restCode, 'Error');
            assert.equal(myErr.restCode, 'Error');
            assert.equal(myErr.message, '');
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, '');
            assert.equal(myErr.body.code, 'Error');

            // create http error with prior cause and options
            var options = {
                message: 'bazbar',
                restCode: 'yay'
            };
            var myErr2 = new RestError(priorErr, options);

            assert.equal(myErr2.we_cause, priorErr);
            assert.equal(myErr2.name, 'RestError');
            assert.equal(myErr2.restCode, options.restCode);
            assert.equal(myErr2.message, options.message);
            assert.isObject(myErr2.body);
            assert.equal(myErr2.body.message, options.message);
            assert.equal(myErr2.body.code, options.restCode);
        });

        it('should create RestError, args should fall through to WError', function() {
            var myErr = new RestError('missing file: "%s"', 'foobar');

            assert.equal(myErr.message, 'missing file: "foobar"');
        });
    });

    describe('Built-in RestError subclasses', function() {

        it('should create BadDigestError, inheriting from RestError/HttpError/WError', function() {
            var myErr = new restErrors.BadDigestError();

            assert.equal(myErr instanceof restErrors.BadDigestError, true);
            assert.equal(myErr instanceof RestError, true);
            assert.equal(myErr instanceof HttpError, true);
            assert.equal(myErr instanceof WError, true);
            assert.equal(myErr instanceof Error, true);
        });

        it('should create BadDigestError, using options object', function() {
            var options = {
                message: 'my http error',
                restCode: 'yay',
                statusCode: 799
            };
            var myErr = new restErrors.BadDigestError(options);

            // verify properties on the error
            assert.equal(myErr.name, 'BadDigestError');
            assert.equal(myErr.restCode, options.restCode);
            assert.equal(myErr.message, options.message);
            assert.equal(myErr.statusCode, options.statusCode);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, options.message);
            assert.equal(myErr.body.code, options.restCode);
        });

        it('should create BadDigestError, args should fall through to WError', function() {
            var myErr = new restErrors.BadDigestError('missing file: "%s"', 'foobar');

            assert.equal(myErr.name, 'BadDigestError');
            assert.equal(myErr.restCode, 'BadDigest');
            assert.equal(myErr.statusCode, 400);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, 'missing file: "foobar"');
            assert.equal(myErr.body.code, 'BadDigest');
        });

        it('should create BadDigestError using options, should prefer sprintf over options', function() {
            var myErr = new restErrors.BadDigestError({
                restCode: 'Bad Digestion',
                message: 'this error should not match'
            }, 'missing file: "%s"', 'foobar');

            assert.equal(myErr.name, 'BadDigestError');
            assert.equal(myErr.restCode, 'Bad Digestion');
            assert.equal(myErr.statusCode, 400);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, 'missing file: "foobar"');
            assert.equal(myErr.body.code, 'Bad Digestion');

        });
    });

    describe('helpers', function() {

        function parse() {
            return helpers.parseVariadicArgs(arguments);
        }
        function parseWErrorArgs() {
            return helpers.parseVariadicArgs(arguments, true);
        }

        it('should parse variadic arguments with priorCause and options', function() {

            var err = new Error('foobar');
            var options = {
                statusCode: 101,
                message: 'hi'
            };
            var parsed = parse(new Error('foobar'), options);

            assert.deepEqual(parsed.args, [ err, options ]);
            assert.deepEqual(parsed.options, options);
        });

        it('should parse variadic arguments with options', function() {

            var options = {
                statusCode: 101,
                message: 'hi'
            };
            var parsed = parse(options);

            assert.deepEqual(parsed.args, [ options ]);
            assert.deepEqual(parsed.options, options);
        });

        it('should parse variadic arguments with strings (pass through to WError)', function() {

            var parsed = parse('missing file: "%s"', 'foobar');

            assert.deepEqual(parsed.args, [ 'missing file: "%s"', 'foobar']);
            assert.deepEqual(parsed.options, null);
        });

        it('should parse variadic arguments with priorCause and strings (pass through to WError)', function() {

            var err = new Error('foobar');
            var parsed = parse(err, 'a', 'b', 'c');

            assert.deepEqual(parsed.args, [ err, 'a', 'b', 'c' ]);
            assert.deepEqual(parsed.options, null);
        });

        it('should strip options object when super constructor is WError (with prior cause)', function() {

            var err = new Error('foobar');
            var options = {
                statusCode: 101,
                message: 'hi'
            };
            var parsed = parseWErrorArgs(new Error('foobar'), options);

            assert.deepEqual(parsed.args, [ err ]);
            assert.deepEqual(parsed.options, options);
        });

        it('should strip options object when super constructor is WError (no prior cause)', function() {

            var options = {
                statusCode: 101,
                message: 'hi'
            };
            var parsed = parseWErrorArgs(options);

            assert.deepEqual(parsed.args, []);
            assert.deepEqual(parsed.options, options);
        });
    });

    describe('stack trace cleanliness', function() {
        it('should have test file as first line of HttpError stack trace', function testStack1() {
            var httpErr = new HttpError('http error');
            var stack = httpErr.stack.split('\n');

            // ensure stack trace's first line is the test file.
            assert.equal(_.includes(stack[0], 'HttpError: http error'), true);
            assert.equal(_.includes(stack[1], 'Context.testStack1'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });

        it('should have test file as first line of built-in HttpError stack trace', function testStack2() {
            // test built in http errors
            var badReqErr = new httpErrors.BadRequestError('i am bad');
            var stack = badReqErr.stack.split('\n');

            assert.equal(_.includes(stack[0], 'BadRequestError: i am bad'), true);
            assert.equal(_.includes(stack[1], 'Context.testStack2'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });

        it('should have test file as first line in RestError stack trace', function testStack3() {
            // test built in http errors
            var restErr = new RestError('i am rest');
            var stack = restErr.stack.split('\n');

            assert.equal(_.includes(stack[0], 'RestError: i am rest'), true);
            assert.equal(_.includes(stack[1], 'Context.testStack3'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });

        it('should have test file as first line of built-in RestError stack trace', function testStack4() {
            // test built in http errors
            var badDigestError = new restErrors.BadDigestError('indigestion');
            var stack = badDigestError.stack.split('\n');

            assert.equal(_.includes(stack[0], 'BadDigestError: indigestion'), true);
            assert.equal(_.includes(stack[1], 'Context.testStack4'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });

        it('should have test file as first line of subclass error stack trace', function testStack5() {
            var ExecutionError = restifyErrors.makeConstructor('ExecutionError');
            var err = new ExecutionError('did not charge long enough');
            var stack = err.stack.split('\n');

            assert.equal(_.includes(stack[0], 'ExecutionError: did not charge long enough'), true);
            assert.equal(_.includes(stack[1], 'Context.testStack5'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });

        it('should have test file as first line of stack trace for error created via makeErrFromCode', function testStack6() {
            var err = restifyErrors.makeErrFromCode(401, 'no creds');
            var stack = err.stack.split('\n');

            assert.equal(_.includes(stack[0], 'UnauthorizedError: no creds'), true);
            assert.equal(_.includes(stack[1], 'Context.testStack6'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });
    });

    describe('main exports', function() {

        it('should export a constructor for every http error code (400-500)', function() {
            // ensure we have the same amount of errors for every http error
            // exposed on the core http module. we only care about http status
            // codes 400-500.
            var numRawErrors = _.filter(http.STATUS_CODES, function(desc, code) {
                                    return parseInt(code, 10) >= 400;
                                })
                                .length;

            assert.equal(
                numRawErrors,
                _.size(httpErrors)
            );

            // ensure each one has a displayName that ends in 'Error'
            // then try to new up one of each.
            _.forEach(httpErrors, function(ErrCtor) {
                assert.isString(ErrCtor.displayName);
                assert.equal(_.endsWith(ErrCtor.displayName, 'Error'), true);

                var err = new ErrCtor();
                assert.equal(err instanceof Error, true);
            });
        });

        it('should export a constructor for every built-in RestError type', function() {
            // no good way to verify we got all the constructors, so it's hard
            // coded for now.
            // 16 built-in RestError subclasses
            assert.equal(_.size(restErrors), 16);

            // ensure each one has a displayName that ends in 'Error'
            // then try to new up one of each.
            _.forEach(httpErrors, function(ErrCtor) {
                assert.isString(ErrCtor.displayName);
                assert.equal(_.endsWith(ErrCtor.displayName, 'Error'), true);

                var err = new ErrCtor();
                assert.equal(err instanceof Error, true);
            });
        });

        it('should export roll up of all constructors', function() {
            assert.isObject(restifyErrors);
            // again, no way to know since we programatically create errors,
            // but ensure at least we have all RestErrors
            assert.isAbove(_.size(restifyErrors), 30);
        });

        it('should have restCode properties for all RestCode constructors', function() {
            _.forEach(restErrors, function(RestErr) {
                var err = new RestErr();
                // strip off the last 5 chars ('Error') and do an assertion
                assert.equal(err.restCode, RestErr.displayName.slice(0, -5));
            });
        });

        it('should create custom error using "make"', function() {
            var underlyingErr = new Error('underlying error!');
            var ExecutionError = restifyErrors.makeConstructor('ExecutionError', {
                statusCode: 406,
                failureType: 'motion'
            });
            var err = new ExecutionError(underlyingErr, 'bad joystick input');

            assert.equal(err instanceof ExecutionError, true);
            assert.equal(err instanceof RestError, true);
            assert.equal(err instanceof HttpError, true);
            assert.equal(err instanceof WError, true);
            assert.equal(err instanceof Error, true);
            assert.equal(err.message, 'bad joystick input');
            assert.equal(err.statusCode, 406);
            assert.equal(err.failureType, 'motion');
            assert.isObject(err.body);
            assert.equal(err.body.code, 'Error');
            assert.equal(err.body.message, 'bad joystick input');
            assert.equal(err.we_cause, underlyingErr);
        });

        it('should create an error from an http status code', function() {
            var err = restifyErrors.makeErrFromCode(406, 'the horror');

            assert.equal(err instanceof restifyErrors.NotAcceptableError, true);
            assert.equal(err instanceof HttpError, true);
            assert.equal(err instanceof WError, true);
            assert.equal(err instanceof Error, true);
            assert.equal(err.message, 'the horror');
            assert.equal(err.statusCode, 406);
            assert.isObject(err.body);
            assert.equal(err.body.code, 'NotAcceptableError');
            assert.equal(err.body.message, 'the horror');
        });
    });
});
