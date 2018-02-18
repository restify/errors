// jscs:disable maximumLineLength

'use strict';


// core modules
var http = require('http');

// userland
var assert = require('chai').assert;
var bunyan = require('bunyan');
var _ = require('lodash');
var restify = require('restify');
var restifyClients = require('restify-clients');
var verror = require('verror');
var WError = verror.WError;

// internal
var helpers = require('../lib/helpers');
var HttpError = require('../lib/baseClasses/HttpError');
var RestError = require('../lib/baseClasses/RestError');
var httpErrors = require('../lib/httpErrors');
var restErrors = require('../lib/restErrors');
var restifyErrors = require('../lib/index.js');



describe('restify-errors node module.', function() {

    var ExecutionError;

    describe('HttpError class', function() {

        it('should create generic HttpError, inheriting from WError',
        function() {
            var myErr = new HttpError();

            assert.equal(myErr instanceof HttpError, true);
            assert.equal(myErr instanceof WError, true);
            assert.equal(myErr instanceof Error, true);

            assert.equal(myErr.code, 'Error');
            assert.deepEqual(JSON.stringify(myErr), JSON.stringify({
                code: 'Error',
                message: ''
            }));
        });

        it('should create HttpError using options object', function() {
            var options = {
                statusCode: 799,
                code: 'myhttp',
                info: {
                    foo: 'bar',
                    baz: [ 1, 2, 3 ]
                }
            };
            var errMsg = 'my http error';
            var myErr = new HttpError(options, errMsg);

            // verify properties on the error
            assert.equal(myErr.name, 'HttpError');
            assert.equal(myErr.message, errMsg);
            assert.equal(myErr.statusCode, options.statusCode);
            assert.equal(myErr.code, 'myhttp');
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, errMsg);
            assert.equal(myErr.body.code, 'myhttp');
            assert.deepEqual(restifyErrors.info(myErr), options.info);
        });

        it('should create HttpError and retain a prior cause', function() {
            // create http error with prior cause
            var priorErr = new Error('foobar');
            var myErr = new HttpError(priorErr, 'new message');

            assert.equal(myErr.cause(), priorErr);
            assert.equal(myErr.name, 'HttpError');
            assert.equal(myErr.message, 'new message');
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, 'new message');
            assert.equal(myErr.body.code, 'Error');

            // create http error with prior cause and options
            var myErr2Msg = 'bazbar';
            var myErr2 = new HttpError({
                cause: priorErr
            }, myErr2Msg);

            assert.equal(myErr2.cause(), priorErr);
            assert.equal(myErr2.name, 'HttpError');
            assert.equal(myErr2.message, myErr2Msg);
            assert.isObject(myErr2.body);
            assert.equal(myErr2.body.message, myErr2Msg);
            assert.equal(myErr2.body.code, 'Error');
        });

        it('should create HttpError, args should fall through to WError',
        function() {
            var myErr = new HttpError('missing file: "%s"', 'foobar');

            assert.equal(myErr.message, 'missing file: "foobar"');
        });

        it('should support .context property getter', function() {

            var info = {
                a: 1,
                b: 2
            };
            var myErr = new HttpError({
                info: info
            }, 'boom');

            assert.deepEqual(verror.info(myErr), info);
            assert.deepEqual(restifyErrors.info(myErr), info);
            assert.deepEqual(myErr.info(), info);
            assert.deepEqual(myErr.context, info);
        });

        it('should override default toJSON and toString', function() {
            var myErr = new HttpError({
                statusCode: 999,
                toString: function() {
                    return 'boom';
                },
                toJSON: function() {
                    var statusCode = this.statusCode;
                    return {
                        statusCode: statusCode
                    };
                }
            }, 'boom');

            assert.strictEqual(myErr.toString(), 'boom');
            assert.strictEqual(
                JSON.stringify(myErr),
                '{"statusCode":999}'
            );
        });
    });

    describe('Built-in HttpError subclasses', function() {

        it('should create BadGatewayError, inheriting from HttpError from ' +
        'WError', function() {
            var myErr = new httpErrors.BadGatewayError();

            assert.equal(myErr instanceof httpErrors.BadGatewayError, true);
            assert.equal(myErr instanceof HttpError, true);
            assert.equal(myErr instanceof WError, true);
            assert.equal(myErr instanceof Error, true);

            // assert default status code
            assert.equal(myErr.code, 'BadGateway');
            assert.equal(myErr.statusCode, 502);
            assert.equal(myErr.message, '');

            // assert stringification
            assert.equal(JSON.stringify(myErr), JSON.stringify({
                code: 'BadGateway',
                message: ''
            }));
        });

        it('should create BadGatewayError using options object', function() {
            var msg = 'my http error';
            var myErr = new httpErrors.BadGatewayError({
                statusCode: 799,  // can pass in any crazy status code
                code: 'myhttp',
                info: {
                    foo: 'bar',
                    baz: [ 1, 2, 3 ]
                }
            }, msg);

            assert.equal(myErr.name, 'BadGatewayError');
            assert.equal(myErr.message, msg);
            assert.equal(myErr.statusCode, 799);
            assert.equal(myErr.code, 'myhttp');
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, msg);
            assert.equal(myErr.body.code, 'myhttp');
            assert.deepEqual(restifyErrors.info(myErr), {
                foo: 'bar',
                baz: [ 1, 2, 3 ]
            });
        });

        it('should create BadGatewayError, and retain a prior cause',
        function() {
            var priorErr = new Error('foobar');
            var myErr = new httpErrors.BadGatewayError(priorErr);

            assert.equal(myErr.cause(), priorErr);
            assert.equal(myErr.name, 'BadGatewayError');
            assert.equal(myErr.statusCode, 502);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, '');
            assert.equal(myErr.body.code, 'BadGateway');

            var myErr2Msg = 'bazbar';
            var myErr2 = new httpErrors.BadGatewayError({
                cause: priorErr
            }, myErr2Msg);

            assert.equal(myErr.cause(), priorErr);
            assert.equal(myErr2.name, 'BadGatewayError');
            assert.equal(myErr2.statusCode, 502);
            assert.equal(myErr2.message, myErr2Msg);
            assert.isObject(myErr2.body);
            assert.equal(myErr2.body.message, myErr2Msg);
            assert.equal(myErr2.body.code, 'BadGateway');
        });

        it('should create BadGatewayError, args should fall through to WError',
        function() {
            var myErr = new httpErrors.BadGatewayError(
                'missing file: "%s"', 'foobar'
            );

            assert.equal(myErr.message, 'missing file: "foobar"');
        });
    });

    describe('RestError class', function() {
        it('should create generic RestError, inheriting from WError',
        function() {
            var myErr = new RestError();

            assert.equal(myErr instanceof RestError, true);
            assert.equal(myErr instanceof WError, true);
            assert.equal(myErr instanceof Error, true);
            assert.equal(myErr.code, 'Error');
            assert.equal(myErr.restCode, 'Error');

            // assert stringification
            assert.equal(JSON.stringify(myErr), JSON.stringify({
                code: 'Error',
                message: ''
            }));
        });

        it('should create RestError, using options object', function() {
            var errMsg = 'my http error';
            var options = {
                statusCode: 799,
                info: {
                    foo: 'bar',
                    baz: [ 1, 2, 3 ]
                }
            };
            var myErr = new RestError(options, errMsg);

            // verify properties on the error
            assert.equal(myErr.name, 'RestError');
            assert.equal(myErr.restCode, 'Error');
            assert.equal(myErr.message, errMsg);
            assert.equal(myErr.statusCode, options.statusCode);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, errMsg);
            assert.equal(myErr.body.code, 'Error');
            assert.deepEqual(restifyErrors.info(myErr), {
                foo: 'bar',
                baz: [ 1, 2, 3 ]
            });
        });

        it('should create RestError, and retain a prior cause', function() {
            // create http error with prior cause
            var priorErr = new Error('foobar');
            var myErr = new RestError(priorErr);

            assert.equal(myErr.cause(), priorErr);
            assert.equal(myErr.name, 'RestError');
            assert.equal(myErr.restCode, 'Error');
            assert.equal(myErr.message, '');
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, '');
            assert.equal(myErr.body.code, 'Error');

            // create http error with prior cause and options
            var errMsg = 'bazbar';
            var options = {
                cause: priorErr,
                restCode: 'yay'
            };
            var myErr2 = new RestError(options, errMsg);

            assert.equal(myErr2.cause(), priorErr);
            assert.equal(myErr2.name, 'RestError');
            assert.equal(myErr2.restCode, options.restCode);
            assert.equal(myErr2.message, errMsg);
            assert.isObject(myErr2.body);
            assert.equal(myErr2.body.message, errMsg);
            assert.equal(myErr2.body.code, 'yay');
        });

        it('should create RestError, args should fall through to WError',
        function() {
            var myErr = new RestError('missing file: "%s"', 'foobar');

            assert.equal(myErr.message, 'missing file: "foobar"');
        });
    });

    describe('Built-in RestError subclasses', function() {

        it('should create BadDigestError, inheriting from RestError' +
        '/HttpError/WError', function() {
            var myErr = new restErrors.BadDigestError();

            assert.equal(myErr instanceof restErrors.BadDigestError, true);
            assert.equal(myErr instanceof RestError, true);
            assert.equal(myErr instanceof HttpError, true);
            assert.equal(myErr instanceof WError, true);
            assert.equal(myErr instanceof Error, true);
            assert.equal(myErr.code, 'Error');
            assert.equal(myErr.restCode, 'BadDigest');

            // assert stringification
            assert.equal(JSON.stringify(myErr), JSON.stringify({
                code: 'BadDigest',
                message: ''
            }));
        });

        it('should create BadDigestError, using options object', function() {
            var options = {
                restCode: 'yay',
                statusCode: 799,
                info: {
                    foo: 'bar',
                    baz: [ 1, 2, 3 ]
                }
            };
            var errMsg = 'my http error';
            var myErr = new restErrors.BadDigestError(options, errMsg);

            // verify properties on the error
            assert.equal(myErr.name, 'BadDigestError');
            assert.equal(myErr.restCode, options.restCode);
            assert.equal(myErr.message, errMsg);
            assert.equal(myErr.statusCode, options.statusCode);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, errMsg);
            assert.equal(myErr.body.code, 'yay');
            assert.deepEqual(restifyErrors.info(myErr), {
                foo: 'bar',
                baz: [ 1, 2, 3 ]
            });
        });

        it('should create BadDigestError, args should fall through to WError',
        function() {
            var myErr = new restErrors.BadDigestError(
                'missing file: "%s"', 'foobar'
            );

            assert.equal(myErr.name, 'BadDigestError');
            assert.equal(myErr.restCode, 'BadDigest');
            assert.equal(myErr.statusCode, 400);
            assert.isObject(myErr.body);
            assert.equal(myErr.body.message, 'missing file: "foobar"');
            assert.equal(myErr.body.code, 'BadDigest');
        });

        it('should create BadDigestError using options, should prefer ' +
        'printf over options', function() {
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
            return helpers.parseVErrorArgs(arguments);
        }

        it('should parse VError arguments with options object', function() {

            var options = {
                statusCode: 101
            };
            var parsed = parse(options);

            assert.deepEqual(parsed, {
                verrorArgs: [{}],
                internalOpts: {
                    statusCode: 101
                }
            });
        });

        it('should parse VError arguments with strings (pass through to ' +
        'WError)', function() {

            var parsed = parse('missing file: "%s"', 'foobar');

            assert.deepEqual(parsed, {
                verrorArgs: [ 'missing file: "%s"', 'foobar' ],
                internalOpts: {}
            });
        });

        it('should parse variadic arguments with priorCause and strings ' +
        '(pass through to WError)', function() {

            var err = new Error('foobar');
            var parsed = parse(err, 'a', 'b', 'c');

            assert.deepEqual(parsed, {
                verrorArgs: [ err, 'a', 'b', 'c' ],
                internalOpts: {}
            });
        });
    });

    describe('stack trace cleanliness', function() {
        it('should have test file as first line of HttpError stack trace',
        function testStack1() {
            var httpErr = new HttpError('http error');
            var stack = httpErr.stack.split('\n');

            // ensure stack trace's first line is the test file.
            assert.equal(_.includes(stack[0], 'HttpError: http error'), true);
            assert.equal(_.includes(stack[1], 'Context.testStack1'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });

        it('should have test file as first line of built-in HttpError ' +
        'stack trace', function testStack2() {
            // test built in http errors
            var badReqErr = new httpErrors.BadRequestError('i am bad');
            var stack = badReqErr.stack.split('\n');

            assert.equal(
                _.includes(stack[0], 'BadRequestError: i am bad'),
                true
            );
            assert.equal(_.includes(stack[1], 'Context.testStack2'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });

        it('should have test file as first line in RestError stack trace',
        function testStack3() {
            // test built in http errors
            var restErr = new RestError('i am rest');
            var stack = restErr.stack.split('\n');

            assert.equal(_.includes(stack[0], 'RestError: i am rest'), true);
            assert.equal(_.includes(stack[1], 'Context.testStack3'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });

        it('should have test file as first line of built-in RestError stack ' +
        'trace', function testStack4() {
            // test built in http errors
            var badDigestError = new restErrors.BadDigestError('indigestion');
            var stack = badDigestError.stack.split('\n');

            assert.equal(
                _.includes(stack[0], 'BadDigestError: indigestion'),
                true
            );
            assert.equal(_.includes(stack[1], 'Context.testStack4'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });

        it('should have test file as first line of subclass error stack trace',
        function testStack5() {
            var ChargeError = restifyErrors.makeConstructor('ChargeError');
            var err = new ChargeError('did not charge long enough');
            var stack = err.stack.split('\n');

            assert.equal(
                _.includes(stack[0], 'ChargeError: did not charge long enough'),
                true
            );
            assert.equal(_.includes(stack[1], 'Context.testStack5'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });

        it('should have test file as first line of stack trace for error ' +
        'created via makeErrFromCode', function testStack6() {
            var err = restifyErrors.makeErrFromCode(401, 'no creds');
            var stack = err.stack.split('\n');

            assert.equal(
                _.includes(stack[0], 'UnauthorizedError: no creds'),
                true
            );
            assert.equal(_.includes(stack[1], 'Context.testStack6'), true);
            assert.equal(_.includes(stack[1], 'test/index.js'), true);
        });
    });

    describe('main exports', function() {

        it('should export a constructor for every http error code (400-500)',
        function() {
            // ensure we have the same amount of errors for every http error
            // exposed on the core http module. we only care about http status
            // codes 400-500.
            var numRawErrors = _.filter(
                http.STATUS_CODES,
                function(desc, code) {
                    return parseInt(code, 10) >= 400;
                }
            ).length;

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

        it('should export a constructor for every built-in RestError type',
        function() {
            // no good way to verify we got all the constructors, so it's hard
            // coded for now.
            // 16 built-in RestError subclasses
            assert.equal(_.size(restErrors), 15);

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

        it('should have code properties for all HttpError constructors',
        function() {
            _.forEach(httpErrors, function(HttpErr) {
                var err = new HttpErr();
                // strip off the last 5 chars ('Error') and do an assertion
                assert.equal(err.code, HttpErr.displayName.slice(0, -5));
            });
        });

        it('should have restCode properties for all RestError constructors',
        function() {
            _.forEach(restErrors, function(RestErr) {
                var err = new RestErr();
                // strip off the last 5 chars ('Error') and do an assertion
                assert.equal(err.restCode, RestErr.displayName.slice(0, -5));
            });
        });

        it('should create custom error using makeConstructor', function() {
            ExecutionError = restifyErrors.makeConstructor('ExecutionError', {
                statusCode: 406,
                failureType: 'motion',
                code: 'moo',
                message: 'Default Execution Error'
            });
        });

        it('should create custom error instance', function() {
            var underlyingErr = new Error('underlying error!');
            var err = new ExecutionError(underlyingErr, 'bad joystick input');

            assert.equal(err instanceof ExecutionError, true);
            assert.equal(err instanceof RestError, true);
            assert.equal(err instanceof HttpError, true);
            assert.equal(err instanceof WError, true);
            assert.equal(err instanceof Error, true);
            assert.equal(err.message, 'bad joystick input');
            assert.equal(err.statusCode, 406);
            assert.equal(err.failureType, 'motion');
            assert.equal(err.restCode, 'Execution');
            assert.equal(err.code, 'moo');
            assert.isObject(err.body);
            assert.equal(err.body.code, 'Execution');
            assert.equal(err.body.message, 'bad joystick input');
            assert.equal(err.cause(), underlyingErr);

            // assert stringification
            var expectedJSON = {
                code: 'Execution',
                message: 'bad joystick input; ' +
                         'caused by Error: underlying error!'
            };
            assert.equal(JSON.stringify(err), JSON.stringify(expectedJSON));
            assert.equal(
                err.toString(),
                err.name + ': ' + expectedJSON.message
            );
        });

        it('should create custom error instance using options', function() {
            var underlyingErr = new Error('underlying error!');
            var options = {
                cause: underlyingErr,
                statusCode: 799,
                info: {
                    foo: 'bar',
                    baz: [ 1, 2, 3 ]
                }
            };
            var errMsg = 'bad joystick input';
            var err = new ExecutionError(options, errMsg);

            assert.equal(err instanceof ExecutionError, true);
            assert.equal(err instanceof RestError, true);
            assert.equal(err instanceof HttpError, true);
            assert.equal(err instanceof WError, true);
            assert.equal(err instanceof Error, true);
            assert.equal(err.message, 'bad joystick input');
            assert.equal(err.statusCode, 799);
            assert.equal(err.failureType, 'motion');
            assert.equal(err.restCode, 'Execution');
            assert.equal(err.code, 'moo');
            assert.isObject(err.body);
            assert.equal(err.body.code, 'Execution');
            assert.equal(err.body.message, 'bad joystick input');
            assert.equal(err.cause(), underlyingErr);
            assert.deepEqual(restifyErrors.info(err), {
                foo: 'bar',
                baz: [ 1, 2, 3 ]
            });

            // assert stringification
            var expectedJSON = {
                code: 'Execution',
                message: 'bad joystick input; ' +
                         'caused by Error: underlying error!'
            };
            assert.equal(JSON.stringify(err), JSON.stringify(expectedJSON));
            assert.equal(
                err.toString(),
                err.name + ': ' + expectedJSON.message
            );
        });

        it('should create custom error using makeConstructor (with lower ' +
        'case Error name)', function() {
            var underlyingErr = new Error('underlying error!');
            var Executionerror = restifyErrors.makeConstructor(
                'Executionerror',
                {
                    statusCode: 406,
                    failureType: 'motion',
                    code: 'moo'
                }
            );
            var err = new Executionerror(underlyingErr, 'bad joystick input');

            assert.equal(err instanceof Executionerror, true);

            // assert stringification
            var expectedJSON = {
                code: 'Execution',
                message: 'bad joystick input; ' +
                         'caused by Error: underlying error!'
            };
            assert.equal(JSON.stringify(err), JSON.stringify(expectedJSON));
            assert.equal(
                err.toString(),
                err.name + ': ' + expectedJSON.message
            );
        });

        it('should have message property fallback to custom error options',
        function() {
            var err = new ExecutionError('printf-style %s', 'error');
            assert.equal(err.message, 'printf-style error');

            err = new ExecutionError({
                info: {
                    foo: 'bar'
                }
            }, 'printf-style %s', 'error');
            assert.equal(err.message, 'printf-style error');
            assert.deepEqual(restifyErrors.info(err), {
                foo: 'bar'
            });

            err = new ExecutionError();
            assert.equal(err.message, 'Default Execution Error');

            // assert fallback to empty string if no message provided
            var NoDefaultMessageError = restifyErrors.makeConstructor(
                'NoDefaultMessageError'
            );
            err = new NoDefaultMessageError();
            assert.equal(err.message, '');
        });

        it('should create an error from an http status code', function() {
            var err = restifyErrors.makeErrFromCode(406, 'the horror');

            assert.equal(
                err instanceof restifyErrors.NotAcceptableError,
                true
            );
            assert.equal(err instanceof HttpError, true);
            assert.equal(err instanceof WError, true);
            assert.equal(err instanceof Error, true);
            assert.equal(err.message, 'the horror');
            assert.equal(err.statusCode, 406);
            assert.isObject(err.body);
            assert.equal(err.body.code, 'NotAcceptable');
            assert.equal(err.body.message, 'the horror');

            // assert stringification
            assert.equal(JSON.stringify(err), JSON.stringify({
                code: 'NotAcceptable',
                message: 'the horror'
            }));
        });
    });

    describe('restify integration', function() {

        var server;
        var client;

        before(function(done) {
            server = restify.createServer({
                name: 'restifyErrors'
            });
            client = restifyClients.createJSONClient({
                url: 'http://localhost:3000'
            });
            server.listen(3000, done);
        });

        it('should send HttpErrors with status codes', function(done) {
            server.get('/1', function(req, res, next) {
                res.send(new restifyErrors.NotFoundError('gone girl'));
                next();
            });

            client.get('/1', function(err, req, res, data) {
                assert.ok(err);
                assert.equal(res.statusCode, 404);
                assert.equal(data.message, 'gone girl');
                done();
            });
        });

        it('should send RestErrors with status codes', function(done) {
            server.get('/2', function(req, res, next) {
                res.send(new restifyErrors.BadDigestError('indigestion'));
                next();
            });

            client.get('/2', function(err, req, res, data) {
                assert.ok(err);
                assert.equal(res.statusCode, 400);
                assert.equal(data.message, 'indigestion');
                done();
            });
        });

        it('should send custom errors with status codes', function(done) {
            server.get('/3', function(req, res, next) {
                res.send(new ExecutionError('bad joystick input!'));
                next();
            });

            client.get('/3', function(err, req, res, data) {
                assert.ok(err);
                assert.equal(res.statusCode, 406);
                assert.equal(data.message, 'bad joystick input!');
                done();
            });
        });
    });

    describe('bunyan serializer', function() {

        var logger;

        before(function() {
            logger = bunyan.createLogger({
                name: 'unit-test',
                serializers: {
                    err: restifyErrors.bunyanSerializer
                }
            });
        });

        it('should serialize a standard Error', function(done) {

            var err = new Error('boom');

            assert.doesNotThrow(function() {
                logger.error(err, 'standard error');
            });

            done();
        });

        it('should serialize a restify-error Error', function(done) {

            var err = new Error('boom');
            var myErr = new restifyErrors.InternalServerError({
                cause: err,
                context: {
                    foo: 'bar',
                    baz: 1
                }
            }, 'ISE');

            assert.doesNotThrow(function() {
                logger.error(myErr, 'wrapped error');
            });

            done();
        });

        it('should ignore serializer', function(done) {

            // pass an error object without stack
            assert.doesNotThrow(function() {
                logger.error({
                    err: null
                }, 'wrapped error');
            });

            assert.doesNotThrow(function() {
                logger.error({
                    err: {}
                }, 'wrapped error');
            });

            done();
        });

        it('should handle circular refs', function(done) {

            var a = {};
            var b = { foo: a };
            a.foo = b;

            var err = new RestError({
                message: 'boom',
                info: a
            });

            assert.doesNotThrow(function() {
                logger.error({
                    err: err
                }, 'wrapped error');
            });

            done();
        });

        it('should serialize a VError with info', function() {

            var err = new verror.VError({
                name: 'VErrorInfo',
                info: {
                    foo: 'qux',
                    baz: 2
                }
            }, 'this is a verror with info');

            assert.doesNotThrow(function() {
                logger.error(err);
            });
        });

        it('should serialize a MultiError', function() {

            var err1 = new Error('boom');
            var err2 = new restifyErrors.InternalServerError({
                cause: err1,
                info: {
                    foo: 'bar',
                    baz: 1
                }
            }, 'ISE');
            var err3 = new verror.VError({
                name: 'VErrorInfo',
                cause: err1,
                info: {
                    foo: 'qux',
                    baz: 2
                }
            }, 'this is a verror with info');
            var multiError = new verror.MultiError([ err1, err2, err3 ]);

            assert.doesNotThrow(function() {
                logger.error(multiError, 'MultiError');
            });
        });
    });
});
