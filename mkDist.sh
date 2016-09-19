#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

cd $(dirname $0)

if [ "$1" == "BUILD" ]; then
	cd node_modules/sqlite3
	npm install
	npm run prepublish
	node-gyp configure --module_name=node_sqlite3 --module_path=./lib/binding/node-v47-linux-x64
	node-gyp rebuild \
		--tlsarget=0.37.2 \
		--arch=x64 \
		--target_platform=linux \
		--dist-url=https://atom.io/download/atom-shell \
		--module_name=node_sqlite3 \
		--module_path=./lib/binding/node-v47-linux-x64
	cd ../..
fi
electron-packager ./ Mutant \
	--platform=linux \
	--arch=x64 \
	--version=0.37.2 \
	--prune \
	--ignore="fixPrefs.sh" \
	--ignore="fixPrefs.sh" \
	--ignore="misc/icons/*" \
	--ignore="misc/apps.json" \
	--ignore=".gitignore" \
	--ignore=".git" \
	--version-string.FileDescription="Mutant" \
	--version-string.FileVersion="0.1.0" \
	--version-string.ProductVersion="0.1.0" \
	--version-string.ProductName="Mutant" \
	--app-version="0.1.0" \
	--overwrite

# Ownership
echo "Please change ownership of the executable"