#!/bin/bash
[ "$EUID" -ne 0 ] && echo "Please run as root." && exit
[[ "$(node -v)" != "v5."* && "$(node -v)" != "v4."* ]] && echo "Please install a newer version of node and continue." && exit
[[ "$(electron -v)" != "v0.36."* ]] && echo "Please install a newer version of electron and continue." && exit

sudo apt-get install -y pkg-config gtk+-3.0 librsvg2-dev
sudo npm install
cd install
	./gtkcc.sh listApps
	./gtkcc.sh themeTest
	# Returns 1 if action required, 0 else
	#[[ ./themeTest ]] && printf "Unable to guess current theme,\nplease go to the appearance settings tab,\nget the theme name \
	#paste it here and press intro. :(\n" && read theme
	
	# By now, just setup for Ubuntu
	echo "{\"theme\": \"Humanity\"}" > ../misc/setup.json
	echo "{  \"command\": \"launch\", \"shortcut\": \"Ctrl+Space\" }" > ../misc/shortcuts.json
cd ..
# Clean
[[ -f ./back/listApps ]] && rm ./back/listApps
mv ./install/listApps ./back/listApps
rm ./install/themeTest

# Make the launcher
echo "[Desktop Entry]" > Mutant.desktop
echo "Encoding=UTF-8" >> Mutant.desktop
echo "Version=1.0" >> Mutant.desktop
echo "Name=The Mutant" >> Mutant.desktop
echo "Comment=Efficiency program" >> Mutant.desktop
echo "Exec=electron $(pwd)" >> Mutant.desktop
echo "Terminal=false" >> Mutant.desktop
echo "Type=Application" >> Mutant.desktop
echo "Categories=Utility;" >> Mutant.desktop