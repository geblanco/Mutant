#!/bin/bash

# Enter Working Dir (shall be project root)
srcDir="$1"

[[ -d "$srcDir" ]] || exit 255;

arch=x64
$srcDir/node_modules/.bin/electron-packager $srcDir/ mutant \
	--platform=linux \
	--arch=${arch} \
	--version=1.4.0 \
	--ignore=".gitignore" \
	--ignore=".git" \
	--ignore="Model.md" \
	--version-string.FileDescription="Mutant" \
	--version-string.FileVersion="0.1.4" \
	--version-string.ProductVersion="0.1.4" \
	--version-string.ProductName="Mutant" \
	--app-version="0.1.4" \
	--overwrite