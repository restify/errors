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
NPM		:= npm
COVERALLS	:= $(NODE_BIN)/coveralls
ESLINT		:= $(NODE_BIN)/eslint
ISTANBUL	:= $(NODE_BIN)/istanbul
MOCHA		:= $(NODE_BIN)/mocha
_MOCHA		:= $(NODE_BIN)/_mocha
NSP		:= $(NODE_BIN)/nsp
UNLEASH		:= $(NODE_BIN)/unleash


#
# Files
#
LCOV		:= $(ROOT)/coverage/lcov.info
PACKAGE_JSON	:= $(ROOT)/package.json
SHRINKWRAP	:= $(ROOT)/npm-shrinkwrap.json
GITHOOKS	:= $(wildcard $(GITHOOKS_SRC)/*)
ALL_FILES	:= $(shell find $(ROOT) \
			-not \( -path $(NODE_MODULES) -prune \) \
			-not \( -path $(COVERAGE) -prune \) \
			-name '*.js' -type f)


#
# Targets
#

.PHONY: all
all: node_modules lint test clean-coverage


node_modules: package.json
	$(NPM) install
	@touch $(NODE_MODULES)


.PHONY: githooks
githooks:
	@ln -s $(GIT_HOOK_SRC) $(GIT_HOOK_DEST)


.PHONY: lint
lint: node_modules $(ESLINT) $(ALL_FILES)
	@$(ESLINT) $(ALL_FILES)


# make nsp always pass - run this as separate travis task for "reporting"
.PHONY: nsp
nsp: node_modules $(NSP)
	@$(NPM) shrinkwrap --dev
	@($(NSP) check)
	@rm $(SHRINKWRAP)


.PHONY: prepush
prepush: node_modules lint test nsp


.PHONY: test
test: node_modules
	@$(MOCHA) -R spec --full-trace


.PHONY: coverage
coverage: node_modules clean-coverage
	@$(ISTANBUL) cover $(_MOCHA) --report lcovonly -- -R spec


.PHONY: report-coverage
report-coverage: coverage
	@cat $(LCOV) | $(COVERALLS)


.PHONY: clean-coverage
clean-coverage:
	@rm -rf $(COVERAGE)


.PHONY: clean
clean: clean-coverage
	@rm -rf $(NODE_MODULES)


#
## Debug -- print out a a variable via `make print-FOO`
#
print-%  : ; @echo $* = $($*)
