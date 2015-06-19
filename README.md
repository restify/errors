# restify-errors

> A collection of HTTP and REST Error constructors.

The constructors can be used to new up Error objects with default status codes
set.

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
* 416 RequestedRangeNotSatisfiableError
* 417 ExpectationFailedError
* 418 ImATeapotError
* 422 UnprocessableEntityError
* 423 LockedError
* 423 FailedDependencyError
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

## Usage


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

### Rendering Errors

All Error objects in this module are created a `body` property. Restify
supports 'rendering' Errors as a response, using the `body` property.
You can pass Errors to `res.send` and the error will be rendered out as JSON,
using the Error object's status code:

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

### Customizing Errors

If you'd like to change the status code or message of a built-in Error, you can
pass an options object to the constructor:

```js
function render(req, res, next) {
    var myErr = new errors.InvalidVersionError({
        statusCode: 409,
        message: 'Version not supported with current query params'
    });

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
stack traces. Assume a previous file lookup failed and an error was passed on
to the next handler:

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

For more information about building rich errors, check out
[VError](https://github.com/davepacheco/node-verror).


## API

All error constructors are variadic and accept the following signatures:

### new Error(message)
### new Error(options)
### new Error(priorErr, message)
### new Error(priorErr, options)

All VError and WError signatures are also supported, including
(extsprintf)[https://github.com/davepacheco/node-extsprintf].

The error instances will have the following properties once created:
* `statusCode` {Number} - an http status code
* `name` {String}
* `restCode` {String}
* `body` {Object} - this is used by Restify to render the Error as an objecteasily send out an Error object
as a response.
* `body.code` {String}
* `body.message` {String}

#### message {String}


#### options
* `options.message` {String} - an error message string
* `options.statusCode` {Number} - an http status code
* `options.constructorOpt` {Function} - Error constructor function for cleaner stack traces
* `options.restCode` {Number} - a name for your Error (deprecate?)


## Contributing

Add unit tests for any new or changed functionality. Ensure that lint and style
checks pass.

To start contributing, install the git pre-push hooks:

```sh
npm run githook
```

Before committing, run the prepush hook:

```sh
npm run prepush
```

## License

Copyright (c) 2015 Netflix, Inc.

Licensed under the MIT license.
