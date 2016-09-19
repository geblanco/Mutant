#!/bin/bash

# Change dir to shell script dir
prevDir=$(pwd)
cd $(dirname $0)

echo "==> Search theme..."
if test `which gtk-query-settings`; then
	echo "{\"theme\": $(gtk-query-settings gtk-icon-theme-name | awk '{print $2}') }" > ../misc/theme.json
else
	echo "{\"theme\": $(gsettings get org.gnome.desktop.interface icon-theme | sed -e 's/'\''/"/g') }" > ../misc/theme.json
fi
echo "==> Found: $(cat ../misc/theme.json)"

echo "==> Compile..."
chmod 755 "./gtkcc.sh"
./gtkcc.sh listApps
echo "==> Move..."
mv listApps ../apps/native/
echo "==> Done"

cd ${prevDir}
