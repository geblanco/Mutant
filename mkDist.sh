#!/bin/bash
cd ..
[[ -d mutant_dist ]] && rm -rf mutant_dist
cp -r mutant mutant_dist
blame_files="mutant.desktop
refs
node_modules
tests
mkDist.sh
cached"
for i in $blame_files; do rm -rf "mutant_dist/${i}"; done
mkdir ./mutant_dist/cached
tar cvfz mutant_dist.tar.gz mutant_dist
