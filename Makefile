help:
	$(info make build - Build using jekyll)
	$(info make serve - Run a local jekyll server)
	$(info make clean - Remove build directory)
	@echo

build:
	@jekyll build

serve:
	@jekyll serve

clean:
	@echo "Cleaning..."
	@rm -rf _site .jekyll-cache
