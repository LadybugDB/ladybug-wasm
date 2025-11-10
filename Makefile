.DEFAULT_GOAL := help
SOURCE_FILES := $(shell find . -name '*.cpp' -o -name '*.h') CMakeLists.txt

# lbug/patched: ## Patch files
# 	@cd lbug && \
# 	if git apply --check ../patches/*.patch > /dev/null 2>&1; then \
# 		echo "Applying patches..."; \
# 		git apply ../patches/*.patch; \
# 	fi
# 	touch lbug/patched

.PHONY: check_environment
check_environment: ## check_environment
	@echo "emcc from: `which emcc`"
	@echo "emcmake from: `which emcmake`"
	@echo "emcmake from: `which npm`"

.PHONY: wasm_dev 
wasm_dev_target = build/dev/lbug-wasm.wasm 
$(wasm_dev_target): $(SOURCE_FILES)
	./scripts/build_wasm.sh dev
wasm_dev: $(wasm_dev_target) ## Compile lbug-wasm in development mode

.PHONY: wasm_relsize 
wasm_relsize_target := build/relsize/lbug-wasm.wasm
$(wasm_relsize_target):  $(SOURCE_FILES)
	./scripts/build_wasm.sh relsize
wasm_relsize: $(wasm_relsize_target) ## Compile lbug-wasm in development mode

.PHONY: wasm_relperf
wasm_relperf_target := build/relperf/lbug-wasm.wasm 
$(wasm_relperf_target): $(SOURCE_FILES)
	./scripts/build_wasm.sh relperf
wasm_relperf: $(wasm_relperf_target) ## Compile lbug-wasm in relperf mode

node_modules:
	yarn install
	rm -rf packages/*/node_modules


.PHONY: package
package: $(wasm_relperf_target) node_modules ## Package lbug-wasm
	mkdir -p packages/lbug-wasm/dist
	cp build/relperf/lbug-wasm.* packages/lbug-wasm/dist/
	cp README.md packages/lbug-wasm/
	cp LICENSE.txt packages/lbug-wasm/
	yarn workspace @lbug/lbug-wasm release

.PHONY: package_dev
package_dev: $(wasm_dev_target) node_modules ## Package lbug-wasm
	mkdir -p packages/lbug-wasm/dist
	cp build/dev/lbug-wasm.* packages/lbug-wasm/dist/
	yarn workspace @lbug/lbug-wasm debug

.PHONY: shell 
shell: package ## Build lbug-shell application
	yarn workspace @lbug/lbug-shell build:release

.PHONY: shell_dev 
shell_dev:  ## Start lbug-shell in development mode
	yarn workspace @lbug/lbug-shell start

dev: ## use lbug_dev in plain html
	./scripts/run.sh

benchmark: package ## Run benchmark
	yarn workspace @lbug/benchmarks main

.PHONY: clean
clean:  ## Clean the repository
	rm -rf build
	rm -rf lbug/build
	rm -rf packages/*/node_modules
	rm -rf node_modules
	rm -rf packages/*/dist

.PHONY: help
help:  ## Display this help information
	@echo  "\033[1mAvailable commands:\033[0m"
	@grep -E '^[a-z.A-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}' | sort
