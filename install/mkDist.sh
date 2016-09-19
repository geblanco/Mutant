#!/bin/bash

arch=x64
./node_modules/.bin/electron-packager ./ Mutant \
	--platform=linux \
	--arch=${arch} \
	--version=1.4.0 \
	--prune \
	--ignore="mkDist.sh" \
	--ignore=".gitignore" \
	--ignore=".git" \
	--version-string.FileDescription="Mutant" \
	--version-string.FileVersion="0.1.0" \
	--version-string.ProductVersion="0.1.0" \
	--version-string.ProductName="Mutant" \
	--app-version="0.1.0" \
	--overwrite

# Ownership
# echo "Please change ownership of the executable with 'chmod 755 Mutant-linux-${arch}'"
