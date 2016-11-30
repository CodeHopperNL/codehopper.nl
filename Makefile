.PHONY: help release

help:
	echo "Release script for codehopper.nl"
	echo ""
	echo "	Set the following environment variables:"
	echo "	- CH_DEST_HOST: the hostname / IP address where to copy the files (must give SSH access)"
	echo "	- CH_DEST_PATH: the path of the remote host in which to copy the files"
	echo ""
	echo "You can deploy the files with `make release`"
	exit 1

release:
	if [ "x${CH_DEST_HOST}" == "x" -o "x${CH_DEST_PATH}" == "x" ]; then  $(MAKE) help; else echo "Deploying codehopper.nl to ${CH_DEST_HOST}:${CH_DEST_PATH}"; rsync -avz -e ssh --progress _site/./ ${CH_DEST_HOST}:${CH_DEST_PATH}; fi
