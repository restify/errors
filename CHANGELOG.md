<a name="8.0.2"></a>
## [9.0.1](https://github.com/restify/errors/compare/v9.0.0...v9.0.1) (2026-09-03)


### Bug Fixes

* **deps:** bump @netflix/nerror to ^2.0.1 ([#124](https://github.com/restify/errors/issues/124)) ([29b80e8](https://github.com/restify/errors/commit/29b80e8c1953cb8e413685e2d02af9bd7b36bd2d))
* lower Node engines floor back to &gt;=22.0.0 ([#122](https://github.com/restify/errors/issues/122)) ([7af41ad](https://github.com/restify/errors/commit/7af41ad233d122ed72e7e3dd04e42bcfcf9869db))

## [9.0.0](https://github.com/restify/errors/compare/v8.0.2...v9.0.0) (2026-09-01)


### ⚠ BREAKING CHANGES

* Error instances no longer expose .cause() as a callable function. Consumers must access the spec-compliant .cause property instead. Bump @netflix/nerror dependency/override to ^2.0.0 and package version to 9.0.0 accordingly.

### Bug Fixes

* **ci:** move ci to gha ([7e053db](https://github.com/restify/errors/commit/7e053db9f5fbae7782dfc3bb614faf69068a5de0))
* **ci:** move node 24 to new optional tests ([10564a8](https://github.com/restify/errors/commit/10564a8c26f3f4119a2def4de5b8fe82c543578a))
* include cause in toJSON ([f8cb6fb](https://github.com/restify/errors/commit/f8cb6fb644149262bb7873fc5655965b24a9d61e))
* npm publish workflow ([#113](https://github.com/restify/errors/issues/113)) ([7e94768](https://github.com/restify/errors/commit/7e9476856b44bde4b43a303a24ae45df64c6c9dd))
* use spec Error.cause property instead of legacy cause() function ([#112](https://github.com/restify/errors/issues/112)) ([4a6fb33](https://github.com/restify/errors/commit/4a6fb331e9966ffa97a2c1672aade357b9e04a21))

### 8.0.2 (2019-12-13)


<a name="8.0.1"></a>
### 8.0.1 (2019-07-26)


<a name="8.0.0"></a>
## 8.0.0 (2019-05-06)


#### Bug Fixes

* topLevelFields should not serialize known VError proto fields (#91) ([3060c9c6](https://github.com/restify/errors.git/commit/3060c9c6))
* remove duplication of serialized Error properties (#90) ([1da7c76f](https://github.com/restify/errors.git/commit/1da7c76f))


#### Features

* **HttpError:** use @netflix/nerror instead of verror ([a37b7f00](https://github.com/restify/errors.git/commit/a37b7f00))


#### Breaking Changes

* drop 4.x and 6.x Node support

 ([56daf0b1](https://github.com/restify/errors.git/commit/56daf0b1))
