#
# Directories
#
ROOT_SLASH	:= $(dir $(realpath $(firstword $(MAKEFILE_LIST))))
ROOT		:= $(patsubst %/,%,$(ROOT_SLASH))
TEST		:= $(ROOT)/test
TOOLS		:= $(ROOT)/tools
GITHOOKS_SRC	:= $(TOOLS)/githooks
GITHOOKS_DEST	:= $(ROOT)/.git/hooks


#
# Generated Directories
#
NODE_MODULES	:= $(ROOT)/node_modules
NODE_BIN	:= $(NODE_MODULES)/.bin
COVERAGE	:= $(ROOT)/coverage


#
# Tools and binaries
#
YARN		:= yarn
COVERALLS	:= $(NODE_BIN)/coveralls
ESLINT		:= $(NODE_BIN)/eslint
ISTANBUL	:= $(NODE_BIN)/istanbul
MOCHA		:= $(NODE_BIN)/mocha
_MOCHA		:= $(NODE_BIN)/_mocha
UNLEASH		:= $(NODE_BIN)/unleash


#
# Files
#
LCOV		:= $(ROOT)/coverage/lcov.info
PACKAGE_JSON	:= $(ROOT)/package.json
YARN_LOCK       := $(ROOT)/yarn.lock
GITHOOKS	:= $(wildcard $(GITHOOKS_SRC)/*)
ALL_FILES	:= $(shell find $(ROOT) \
			-not \( -path $(NODE_MODULES) -prune \) \
			-not \( -path $(COVERAGE) -prune \) \
			-name '*.js' -type f)


#
# Targets
#

.PHONY: help
help:
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) \
		| sort | awk 'BEGIN {FS = ":.*?## "}; \
		{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


.PHONY: all
all: node_modules lint test clean-coverage


$(YARN_LOCK): $(PACKAGE_JSON)
	@$(YARN)


$(NODE_MODULES): $(PACKAGE_JSON)
	@$(YARN)
	@touch $(NODE_MODULES)


.PHONY: githooks
githooks: ## Install githooks
	@ln -s $(GIT_HOOK_SRC) $(GIT_HOOK_DEST)


.PHONY: lint
lint: $(NODE_MODULES) ## Run lint and style checks
	@$(ESLINT) $(ALL_FILES)


.PHONY: prepush
prepush: $(NODE_MODULES) lint test ## Run all required tasks for a git push


.PHONY: test
test: $(NODE_MODULES) ## Run unit tests
	@$(MOCHA) -R spec --full-trace


.PHONY: coverage
coverage: $(NODE_MODULES) clean-coverage ## Generate test coverage
	@$(ISTANBUL) cover $(_MOCHA) --report lcovonly -- -R spec


.PHONY: report-coverage
report-coverage: $(NODE_MODULES) coverage ## Report test coverage to Coveralls
	@cat $(LCOV) | $(COVERALLS)


.PHONY: clean-coverage
clean-coverage:
	@rm -rf $(COVERAGE)


.PHONY: clean
clean: clean-coverage ## Clean all generated directories
	@rm -rf $(NODE_MODULES)


#
## Debug -- print out a a variable via `make print-FOO`
#
print-%  : ; @echo $* = $($*)
