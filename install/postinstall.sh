#!/bin/bash

# Change dir to shell script dir
cd $(dirname $0)
cd "./install"

if test `which gtk-query-settings`; then
	echo "{\"theme\": $(gtk-query-settings gtk-icon-theme-name | awk '{print $2}') }" > ../misc/theme.json
else
	echo "{\"theme\": $(gsettings get org.gnome.desktop.interface icon-theme | sed -e 's/'\''/"/g') }" > ../misc/theme.json
fi

chmod 755 "./gtkcc.sh"
./gtkcc.sh listApps
mv listApps ../apps/native/

cd ..
