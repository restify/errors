# restify-errors

[![NPM Version](https://img.shields.io/npm/v/restify-errors.svg)](https://npmjs.org/package/restify-errors)
[![Build Status](https://travis-ci.org/restify/errors.svg?branch=master)](https://travis-ci.org/restify/errors)
[![Coverage Status](https://coveralls.io/repos/restify/errors/badge.svg?branch=master)](https://coveralls.io/r/restify/errors?branch=master)
[![Dependency Status](https://david-dm.org/restify/errors.svg)](https://david-dm.org/restify/errors)
[![devDependency Status](https://david-dm.org/restify/errors/dev-status.svg)](https://david-dm.org/restify/errors#info=devDependencies)
[![bitHound Score](https://www.bithound.io/github/restify/errors/badges/score.svg)](https://www.bithound.io/github/restify/errors/master)

> A collection of HTTP and REST Error constructors.

This module ships with a set of constructors that can be used to new up Error
objects with default status codes.

The module ships with the following HttpErrors:

* 400 BadRequestError
* 401 UnauthorizedError
* 402 PaymentRequiredError
* 403 ForbiddenError
* 404 NotFoundError
* 405 MethodNotAllowedError
* 406 NotAcceptableError
* 407 ProxyAuthenticationRequiredError
* 408 RequestTimeoutError
* 409 ConflictError
* 410 GoneError
* 411 LengthRequiredError
* 412 PreconditionFailedError
* 413 RequestEntityTooLargeError
* 414 RequesturiTooLargeError
* 415 UnsupportedMediaTypeError
* 416 RangeNotSatisfiableError (For Node >= 4 & iojs >= 3)
* 416 RequestedRangeNotSatisfiableError (For Node 0.x & iojs < 3)
* 417 ExpectationFailedError
* 418 ImATeapotError
* 422 UnprocessableEntityError
* 423 LockedError
* 424 FailedDependencyError
* 425 UnorderedCollectionError
* 426 UpgradeRequiredError
* 428 PreconditionRequiredError
* 429 TooManyRequestsError
* 431 RequestHeaderFieldsTooLargeError
* 500 InternalServerError
* 501 NotImplementedError
* 502 BadGatewayError
* 503 ServiceUnavailableError
* 504 GatewayTimeoutError
* 505 HttpVersionNotSupportedError
* 506 VariantAlsoNegotiatesError
* 507 InsufficientStorageError
* 509 BandwidthLimitExceededError
* 510 NotExtendedError
* 511 NetworkAuthenticationRequiredError

and the following RestErrors:

* 400 BadDigestError
* 405 BadMethodError
* 500 InternalError
* 409 InvalidArgumentError
* 400 InvalidContentError
* 401 InvalidCredentialsError
* 400 InvalidHeaderError
* 400 InvalidVersionError
* 409 MissingParameterError
* 403 NotAuthorizedError
* 412 PreconditionFailedError
* 400 RequestExpiredError
* 429 RequestThrottledError
* 404 ResourceNotFoundError
* 406 WrongAcceptError

Some of the status codes overlap, since applications can choose the most
applicable error type and status code for a given scenario. Should your given
scenario require something more customized, the Error objects can be customized
with an options object.

## Getting Started

Install the module with: `npm install restify-errors`

For TypeScript type definitions: `npm install @types/restify-errors`

## Usage

### Migration from 5.x to 6.x

As of 6.x this module is now a thin wrapper over the
[VError](https://github.com/davepacheco/node-verror) module. Every Error
constructor exposed by this module inherits from VError, which means the
constructor signatures are now also identical to VError.

All VError static methods are also re-exported on the restify-errors export
object. For all intents and purposes, you should treat this library as an
extension of VError, with a list of built in constructors and sugar functions.

The primary difference between the old 5.x and 6.x API is a reshuffling of the
option names and where they are provided. In 5.x:

```js
const err = new errors.InternalServerError(priorErr, {
    message: 'boom!',
    context: { foo: 'bar' }
});
```

In 6.x:

```js
const err = new errors.InternalServerError({
    cause: priorErr,
    info: { foo: 'bar' }
}, 'boom!');
```

### Context/Info object
In 5.x, the `.context` property was used to store and capture context about the
scenario causing the error. This concept is still supported, but now uses
VError's info object to achieve the same thing. As it uses the VError APIs, all
you have to now is pass `info` instead of `context` when creating an Error.

For migration purposes, accessing the info object via `.context` will be
supported through 6.x, and the serializer will also continue to support it.
Both may be deprecated in future versions. To access the info object, you can
use the VError static method `.info()`, which is re-exported on the
restify-errors exports:

```js
var errors = require('restify-errors');
var nerror = require('@netflix/nerror');

var err = new errors.InternalServerError({
    info: {
        foo: 'bar'
    }
});
errors.info(err);  // => { foo: 'bar' }
verror.info(err);  // => { foo: 'bar' }
```

Note that using verror directly also works, since all Error objects created by
this library inherit from VError.

### Custom constructors

In 5.x, using the `makeConstructor` class would add the constructor itself to
restify-error's module.exports object. This was problematic in complex
applications, where custom Error constructors could be shared across multiple
modules in multiple contexts.

As a result, in 6.x, custom constructors are no longer stored on the
module.exports object, and it is the user's responsibility to retain a
reference to those custom constructors.


### Creating Errors

In your application, create errors by using the constructors:

```js
var errors = require('restify-errors');

server.get('/foo', function(req, res, next) {

    if (!req.query.foo) {
        return next(new errors.BadRequestError());
    }

    res.send(200, 'ok!');
    return next();
});
```

### Checking Error types

You can easily do instance checks against the Error objects:

```js
function redirectIfErr(req, res, next) {
    var err = req.data.error;
    if (err) {
        if (err instanceof errors.InternalServerError) {
            next(err);
        } else if (err instanceof errors.NotFoundError) {
            res.redirect('/NotFound', next);
        }
    }
}
```

You can also check against the `.code` or `.name` properties in case there are
multiple copies of restify-error in your application process:

```js
function redirectIfErr(req, res, next) {
    var err = req.data.error;
    if (err) {
        if (err.name === 'InternalServerError' ||
        err.code === 'InternalServer') {
            next(err);
        } else if (err instanceof errors.NotFoundError) {
            res.redirect('/NotFound', next);
        }
    }
}
```

### Serializing Errors

All Error objects in this module ship with both a `toString()` and `toJSON()`
methods. Restify uses these methods to "render" errors when they are passed to
`res.send()`:

```js
function render(req, res, next) {
    res.send(new errors.InternalServerError());
    return next();
}

// => restify will render an application/json response with an http 500:
// {
//     code: 'InternalServerError',
//     message: ''
// }
```

You can override either of these methods to customize the serialization of an
error.

### Customizing Errors

If you'd like to change the status code or message of a built-in Error, you can
pass an options object to the constructor:

```js
function render(req, res, next) {
    var myErr = new errors.InvalidVersionError({
        statusCode: 409
    }, 'Version not supported with current query params');

    res.send(myErr);
    return next();
}

// => even though InvalidVersionError has a built-in status code of 400, it
//    has been customized with a 409 status code. restify will now render an
//    application/json response with an http 409:
// {
//     code: 'InvalidVersionError',
//     message: 'Version not supported with current query params'
// }
```

### Passing in prior errors (causes)

Like [WError](https://github.com/davepacheco/node-verror), all constructors
accept an Error object as the first argument to build rich Error objects and
stack traces. Assume a previous file lookup failed and an error was passed on:

```js
function wrapError(req, res, next) {

    if (req.error) {
        var myErr = new errors.InternalServerError(req.error, 'bad times!');
        return next(myErr);
    }
    return next();
}
```

This will allow Error objects to maintain context from previous errors, giving
you full visibility into what caused an underlying issue:

```js
console.log(myErr.message);
// => 'bad times!'

console.log(myErr.toString());
// => InternalServerError: bad times!; caused by Error: file lookup failed!

// if you're using Bunyan, you'll get rich stack traces:
bunyanLogger.info(myErr);

InternalServerError: bad times!
    at Object.<anonymous> (/Users/restify/test.js:30:16)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3
Caused by: Error: file lookup failed!
    at Object.<anonymous> (/Users/restify/test.js:29:15)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3
```

### Bunyan/Pino support

Since errors created via restify-errors inherit from VError, you'll get out of
the box support via bunyan's standard serializers. If you are using the
`info` property, you can use the serializer shipped with restify-errors:

```js
var bunyan = require('bunyan');
var restifyErrors = require('restify-errors');

var log = bunyan.createLogger({
    name: 'myLogger',
    serializers: {
        err: restifyErrors.bunyanSerializer
    }
});

var err = new restifyErrors.InternalServerError({
    info: {
        foo: 'bar',
        bar: 1
    }
}, 'cannot service this request');

log.error(err, 'oh noes');
```

```sh
[2016-08-31T22:27:13.117Z] ERROR: log/51633 on laptop: oh noes (err.code=InternalServer)
    InternalServerError: cannot service this request! (foo="bar", bar=1)
        at Object.<anonymous> (/restify/test.js:11:11)
        at Module._compile (module.js:409:26)
        at Object.Module._extensions..js (module.js:416:10)
        at Module.load (module.js:343:32)
        at Function.Module._load (module.js:300:12)
        at Function.Module.runMain (module.js:441:10)
        at startup (node.js:139:18)
        at node.js:974:3
```

You can, of course, combine this with the standard set of serializers that
bunyan ships with. VError's MultiError is also supported:

```js
var underlyingErr = new Error('boom');
var multiErr = new verror.MultiError([
    new Error('boom'),
    new restifyErrors.InternalServerError({
        cause: underlyingErr,
        info: {
            foo: 'bar',
            baz: 1
        }
    }, 'wrapped')
]);

log.error(multiErr, 'oh noes');
```

```
[2016-08-31T22:48:43.244Z] ERROR: logger/55311 on laptop: oh noes
    MultiError 1 of 2: Error: boom
        at Object.<anonymous> (/restify/test.js:16:5)
        at Module._compile (module.js:409:26)
        at Object.Module._extensions..js (module.js:416:10)
        at Module.load (module.js:343:32)
        at Function.Module._load (module.js:300:12)
        at Function.Module.runMain (module.js:441:10)
        at startup (node.js:139:18)
        at node.js:974:3
    MultiError 2 of 2: InternalServerError: wrapped (foo="bar", baz=1)
        at Object.<anonymous> (/restify/test.js:17:5)
        at Module._compile (module.js:409:26)
        at Object.Module._extensions..js (module.js:416:10)
        at Module.load (module.js:343:32)
        at Function.Module._load (module.js:300:12)
        at Function.Module.runMain (module.js:441:10)
        at startup (node.js:139:18)
        at node.js:974:3
    Caused by: Error: boom
        at Object.<anonymous> (/restify/test.js:14:21)
        at Module._compile (module.js:409:26)
        at Object.Module._extensions..js (module.js:416:10)
        at Module.load (module.js:343:32)
        at Function.Module._load (module.js:300:12)
        at Function.Module.runMain (module.js:441:10)
        at startup (node.js:139:18)
        at node.js:974:3
```

For more information about building rich errors, check out
[VError](https://github.com/davepacheco/node-verror).


#### Customizing the serializer

The serializer can also be customized. The serializer currently supports
the following options:

* `options.topLevelFields` {Boolean} - if true, serializes all top level fields
 found on the error object, minus "known" Error/VError fields. This can be
 useful if errors are created in dependencies that don't use VError or
 restify-errors to maintain context in an independent object.

For example:

```js
var bunyan = require('bunyan');
var restifyErrors = require('restify-errors');

var log = bunyan.createLogger({
    name: 'myLogger',
    serializers: restifyErrors.bunyanSerializer.create({
        topLevelFields: true
    })
});

var err = new Error('pull!');
err.espresso = 'normale';

log.error(err, 'oh noes!');
```

```sh
[2018-05-22T01:32:25.164Z] ERROR: myLogger/61085 on laptop: oh noes!
    Error: pull! (espresso="normale")
        at Object.<anonymous> (/restify/serializer.js:11:11)
        at Module._compile (module.js:577:32)
        at Object.Module._extensions..js (module.js:586:10)
        at Module.load (module.js:494:32)
        at tryModuleLoad (module.js:453:12)
        at Function.Module._load (module.js:445:3)
        at Module.runMain (module.js:611:10)
        at run (bootstrap_node.js:387:7)
        at startup (bootstrap_node.js:153:9)
```




### Subclassing Errors

You can also create your own Error subclasses by using the provided
`makeConstructor()` method.

```js
errors.makeConstructor('ExecutionError', {
    statusCode: 406,
    failureType: 'motion',
    message: 'my default message'
});
var myErr = new errors.ExecutionError('bad joystick input!');

console.log(myErr instanceof ExecutionError);
// => true

console.log(myErr.message);
// => 'ExecutionError: bad joystick input!'

console.log(myErr.failureType);
// => 'motion'

console.log(myErr.statusCode);
// => 406

console.log(myErr.stack);

ExecutionError: bad joystick input!
    at Object.<anonymous> (/Users/restify/test.js:30:16)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3
```


## API

All Error constructors are variadic and accept the following signatures, which
are identical to the
[VError and WError](https://github.com/davepacheoco/node-verror) signatures.

### new Error(sprintf_args...)
### new Error(priorErr [, sprintf_args...])
### new Error(options [, sprinf_args...])

restify-errors adds additional options for the final signature:

* `options.restCode` {Number} - a description code for your Error. This is used
by restify to render an error when it is directly passed to `res.send()`. By
default, it is the name of your error constructor (e.g., the restCode for a
BadDigestError is BadDigest).
* `options.statusCode` {Number} - an http status code
* `options.toJSON` {Function} - override the default `toJSON()` method
* `options.toString` {Function} - override the default `toString()` method

### makeConstructor(name [, defaults])

Creates a custom Error constructor, adds it to the existing exports object.

* `name` {String} - the name of your Error
* `defaults` {Object} - an object of default values that will added to the
prototype. It is possible to override the default values for `restCode`,
`statusCode`, `toString()` and `toJSON()`.

**Returns:** {Constructor}

### makeErrFromCode(statusCode [, args...])

Create an Error object using an http status code. This uses `http` module's
`STATUS_CODES` to do the status code lookup. Thus, this convenience method
is useful only for creating HttpErrors, and not RestErrors.

* `statusCode` {Number} - an http status code
* `args` - arguments to be passed on to the constructor

**Returns:** {Object} an Error object


## Contributing

Add unit tests for any new or changed functionality. Ensure that lint and style
checks pass.

To start contributing, install the git pre-push hooks:

```sh
make githooks
```

Before committing, run the prepush hook:

```sh
make prepush
```

If you have style errors, you can auto fix whitespace issues by running:

```sh
make codestyle-fix
```

## License

Copyright (c) 2018 Alex Liu

Licensed under the MIT license.
