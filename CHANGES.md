# Change log

## 7.0.0

- BREAKING: omit node domains from serializer

## 6.1.1

- FIX: don't serialize arbitrary top level fields that are fields known to
  VError classes.

## 6.1.0

- NEW: support serialization of arbitrary top level fields in log serializer.
  this is opt in via the new serializer factory.
- FIX: remove duplication of Error properties for VError objects

## 6.0.0

- BREAKING: All Error constructors now mirror VError constructor APIs. Re-export
  all VError static methods on restify-errors exports.

## 5.0.0

- BREAKING: (arguably a fix) Custom Error constructors now return the custom
  error name when serialized via `toJSON()` or `toString()`

## 4.3.0

- NEW: The bunyan serializer now handles regular VError objects using the new
  `info` property. It also supports VError's MultiError.

## 4.2.3

- FIX: for errors with a cause chain, `toString()` now leverages VError to get
  the full error message when serializing to JSON.

## 4.2.2

- FIX: remove `toString()` method that was overriding VError's existing
  `toString()`. This was causing truncated error messages.

## 4.2.1

- FIX: Fix issue where `e.cause` was assumed to be a function, causing
  serializer to fail.

## 4.2.0

- FIX: Use safe-json-stringify module to to do JSON serialization of objects
  with circular objects.

## 4.1.0

- NEW: add bunyan serializer for handling the new `context` property on errors
  created by restify-errors.


## 4.0.0

- NEW: Error constructor now takes `options.context`, which is a bucket of
  random properties that are saved to the Error object being created.
- NEW: All Errors now have `toString()` and `toJSON()` methods. These are
  overridable via `makeConstructor()`.
- BREAKING: `code` and `restCode` properties were normalized across all
  classes. `code` property now has a value of 'Error' for HttpError and
  RestError. Any subclass will have the name of the error, minus 'Error',
  i.e., GatewayTimeoutError has a code of GatewayTimeout. All code and
  restCode properties are now overridable.

## 3.1.0
- rev dependencies

## 3.0.0
- restify/node-restify#844 Errors now live in its own repo and npm module.
- all error constructors now support [VError](https://github.com/davepacheco/node-verror) constructor args.
- Support subclass and custom error types via `makeConstructor()`
- Support creating errors using HTTP status codes via `makeErrFromCode()`. Was
  previously a private method used to create internal error types, this is now
  exposed publicly for user consumption.

