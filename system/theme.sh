#!/bin/bash

if test `which gtk-query-settings`; then
  theme="$(gtk-query-settings gtk-icon-theme-name | awk '{print $2}')"
else
  theme="$(gsettings get org.gnome.desktop.interface icon-theme | sed -e 's/'\''/"/g')"
fi

echo "##THEME:$theme##"