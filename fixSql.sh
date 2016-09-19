#!/bin/bash

cwd=$(pwd)
cd node_modules/sqlite3/lib/binding/
[[ -L electron-*-linux-x64 ]] && rm electron-*-linux-x64
ln -s node-v47-linux-x64 electron-$(electron -v | head -c 5)-linux-x64
cd $cwd