#!/bin/bash

dist_dir=${1:-./dist}
desktop_file_path=${dist_dir}/mutant.desktop
version=$(node -p "require('./package.json').version")

if [[ ! -d $dist_dir ]]; then
  mkdir -p $dist_dir
fi

echo "[Desktop Entry]" > ${desktop_file_path}
echo "Encoding=UTF-8" >> ${desktop_file_path}
echo "Version=1.0" >> ${desktop_file_path}
echo "Name=mutant" >> ${desktop_file_path}
echo "Comment=Productivity Launcher" >> ${desktop_file_path}
echo "Exec=/opt/mutant/mutant" >> ${desktop_file_path}
echo "Terminal=false" >> ${desktop_file_path}
echo "Type=Application" >> ${desktop_file_path}
echo "Categories=Utility;" >> ${desktop_file_path}

./node_modules/electron-packager/cli.js ./ mutant \
  --platform=linux \
  --arch=x64 \
  --electron-version=$(electron -v | cut -c 2-) \
  --prune \
  --ignore=".gitignore" \
  --ignore="install" \
  --ignore="Model.md" \
  --version-string.FileDescription="Mutant" \
  --version-string.FileVersion="${version}" \
  --version-string.ProductVersion="${version}" \
  --version-string.ProductName="mutant" \
  --app-version="${version}" \
  --out="${dist_dir}" \
  --overwrite

mv ${dist_dir}/mutant-linux-x64 ${dist_dir}/mutant

