#!/bin/bash

if [[ -d ./dist ]]; then
  rm -rf ./dist
fi

mkdir ./dist && cd ./dist

echo "[Desktop Entry]" > mutant.desktop
echo "Encoding=UTF-8" >> mutant.desktop
echo "Version=1.0" >> mutant.desktop
echo "Name=mutant" >> mutant.desktop
echo "Comment=Productivity Launcher" >> mutant.desktop
echo "Exec=/opt/mutant/mutant" >> mutant.desktop
echo "Terminal=false" >> mutant.desktop
echo "Type=Application" >> mutant.desktop
echo "Categories=Utility;" >> mutant.desktop

# TODO copy icon to icons folder
version=$(node -p "require('../package.json').version")

../node_modules/electron-packager/cli.js ../ mutant \
  --platform=linux \
  --arch=x64 \
  --electron-version=$(electron -v | cut -c 2-) \
  --prune \
  --ignore=".gitignore" \
  --ignore="install" \
  --ignore="Model.md" \
  --version-string.FileDescription="Mutant" \
  --version-string.FileVersion="$version" \
  --version-string.ProductVersion="$version" \
  --version-string.ProductName="mutant" \
  --app-version="$version" \
  --overwrite

mv mutant-linux-x64 mutant

cd ..
