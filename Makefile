.SILENT:
.PHONY:  release run

## RSyncs the side folder to the running site. Requires the variable $CH_DEST_HOST and $CH_DEST_PORT to point to the host and port to rsync to.
release:
	if [ "x${CH_DEST_HOST}" == "x" -o "x${CH_DEST_PATH}" == "x" ];
	then
		$(MAKE) help;
	else
		@echo "Deploying codehopper.nl to ${CH_DEST_HOST}:${CH_DEST_PATH}";
		rsync -avz -e ssh --progress _site/./ ${CH_DEST_HOST}:${CH_DEST_PATH};
	fi

## Runs the Jekyll build and starts the server
run:
	@echo "Running CodeHopper.nl"
	bundle exec jekyll serve --watch --future

## Same as `make run`, but enables incremental builds in Jekyll
irun:
	@echo "Running CodeHopper.nl in incremental mode"
	bundle exec jekyll serve --watch --incremental --future


## Displays this help text
help:
	@echo "CodeHopper build script."
	@echo
	@echo "Available targets:"
	@awk '/^[a-zA-Z\-\_0-9]+:/ {                    \
	  nb = sub( /^## /, "", helpMsg );              \
	  if(nb == 0) {                                 \
	    helpMsg = $$0;                              \
	    nb = sub( /^[^:]*:.* ## /, "", helpMsg );   \
	  }                                             \
	  if (nb)                                       \
	    print  $$1 "\t" helpMsg;                    \
	}                                               \
	{ helpMsg = $$0 }'                              \
	$(MAKEFILE_LIST) | column -ts $$'\t' |          \
	grep --color '^[^ ]*'
	@echo
