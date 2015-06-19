# restify-errors

> Collection of Error objects shared across restify components.


## Getting Started

Install the module with: `npm install restify-errors`


## Documentation

A collection of existing HttpErrors and RestErrors constructors for easy reuse.
Also allows for easy subclassing of errors. All errors can be new'd up with
options, and expose default status codes.

restify-errors ships with the following HttpErrors:
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

restify-errors ships with the following RestErrors:
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


## Usage

Coming soon

## API

All error constructors are variadic and can be newed up using the following
signatures.

### new Error(message)
### new Error(options)
### new Error(priorErr, message)
### new Error(priorErr, options)

All VError and WError signatures are also supported.

### options
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
