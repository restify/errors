#
# Tools
#
ESLINT		:= ./node_modules/.bin/eslint
JSCS		:= ./node_modules/.bin/jscs
MOCHA       := ./node_modules/.bin/mocha
ISTANBUL    := ./node_modules/.bin/istanbul
COVERALLS   := ./node_modules/.bin/coveralls
NPM		    := npm

#
# Files
#
GIT_HOOK_SRC   = '../../tools/githooks/pre-push'
GIT_HOOK_DEST  = '.git/hooks/pre-push'
LIB_FILES  	   = './lib'
TEST_FILES     = './test'
COVERAGE_FILES = './coverage'
LCOV           = './coverage/lcov.info'

#
# Targets
#
.PHONY: all
all:
	$(NPM) install

.PHONY: githooks
githooks:
	@ln -s $(GIT_HOOK_SRC) $(GIT_HOOK_DEST)

.PHONY: lint
lint:
	$(ESLINT) $(LIB_FILES) $(TEST_FILES)

.PHONY: codestyle
codestyle:
	$(JSCS) $(LIB_FILES) $(TEST_FILES)

.PHONY: codestyle-fix
codestyle-fix:
	$(JSCS) $(LIB_FILES) $(TEST_FILES) --fix

.PHONY: prepush
prepush: lint codestyle test
	@echo ------------------------------------------
	@echo PRE-PUSH SUCCESS
	@echo ------------------------------------------

.PHONY: test
test:
	$(MOCHA) -R spec

.PHONY: coverage
coverage: clean
	$(ISTANBUL) cover _mocha --report lcovonly -- -R spec

.PHONY: report
report: coverage
	@cat $(LCOV) | $(COVERALLS)

.PHONY: clean
clean:
	@rm -rf $(COVERAGE_FILES)
