#!/bin/bash

# Change dir to shell script dir
cd $(dirname $0)

# Check current Platform
platform="linux"

if [ "$(uname)" == "Darwin" ]; then
	platform="darwin" # Mac OSX
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
	platform="linux"
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
	platform="windows"
fi

if [ "${platform}" != "linux" ]; then
	echo "Sorry this program only works on Linux"
	exit 0;
fi

# Used for package manager
pmanager="(null)"
if hash apt-get 2>/dev/null; then
	pmanager="apt"
elif hash yaourt 2>/dev/null; then
	pmanager="yaourt"
elif hash pacman 2>/dev/null; then
	pmanager="pacman"
fi

# pkg-config
PKG_CONFIG="http://pkgconfig.freedesktop.org/releases/pkg-config-0.28.tar.gz"

echo "=== Installing TensorFlow for $platform ==="

require() {
	if test `which $1`; then
		echo "= $1: Found"
	else
		echo "= $1: Not found"
		exit 1
	fi
}

install_shell() {
	local url=$1
	local name=`basename $url`

	echo ""
	echo "= Installing $name" \
	 && echo "== Downloading $name" \
	 && curl -# -L $url -o $name \
	 && echo "== Changing file to execute mode..." \
	 && chmod +x $name \
	 || exit 1

 	echo "== Installing..."
	if ./$name --user; then

		rm $name
	 	echo "== Sucessfully installed $name"

	else

	 	echo "! Failed to install $name"
	 	rm $name
	 	exit 1

	fi
}

fetch() {
	local tarball=`basename $1`
	local dir=`basename $tarball .tar.gz`

	echo ""
	echo "= downloading $tarball $2"
	curl -# -L $1 -o $tarball \
		&& echo "== unpacking" \
		&& tar -zxf $tarball \
		&& echo "== removing tarball" \
		&& rm -fr $tarball \
		&& make_install $dir $2
}

fetch_xz() {
	local tarball=`basename $1`
	local dir=`basename $tarball .tar.xz`

	echo ""
	echo "= downloading $tarball"
	
	curl -# -L $1 -o $tarball \
		&& echo "== unpacking" \
		&& tar -xJf $tarball \
		&& echo "== removing tarball" \
		&& rm -fr $tarball \
		&& make_install $dir
}

clone(){
	local repo=$1
	local folderName=$2

	echo ""
	echo "= cloning $folderName [url: $repo]"

	# Remove folder before cloning
	rm -rf $folderName

	# Git clone the repo
	git clone --recurse-submodules $repo ./$folderName
}

make_install() {
	local dir=$1

	echo ""
	echo "= installing $1 $2"

 	cd $dir \
	 && ./configure --disable-dependency-tracking --prefix=$PREFIX $2 \
	 && make \
	 && make install \
	 && echo "... removing $dir" \
	 && cd .. && rm -fr $dir
}

install() {
	# Target OS to install
	local os=$1
	# Name of the package
	local name=$2

	# Check if is target OS
	if [ "$platform" != "$os" ]; then
		echo "= $name skipped (not in $os)"
		return
	fi

	# Check if package already installed
	if hash $name 2>/dev/null; then
		echo "= $name already installed"
		return
	fi

	if [ "$platform" == "linux" ]; then

		# Install for Linux
		if [ "$pmanager" == "apt" ]; then
			echo  ""
			echo "= installing with apt-get: $name"

			apt-get install $name -y
		elif [ "$pmanager" == "yaourt" ]; then
			echo  ""
			echo "= installing with yaourt: $name"
			
			yaourt -S --needed --noconfirm $name 
		elif [ "$pmanager" == "pacman" ]; then
			echo  ""
			echo "= installing with pacman: $name"
			
			# AUR packages need to be done by other package manager or by hand
			if [ $3 == "aur" ]; then
				mkdir $name
				cd $name
				curl -L -O "https://aur.archlinux.org/cgit/aur.git/snapshot/$name.tar.gz"
				tar xvfz "$name.tar.gz"
				cd "$name"
				makepkg -sri
				cd ../..
				rm -rf "$name"
			else
				pacman -S --needed --noconfirm $name 
			fi
		else
			echo "! apt-get/yaourt/pacman not installed"
			exit 1
		fi
	elif [ "$platform" == "darwin" ]; then
		
		# Install for Mac OSX
		if hash brew 2>/dev/null; then
			echo ""
			echo "= installing with brew: $name"

			brew install $name -y
		else
			echo "! brew not installed"
			exit 1
		fi
	fi
}

echo ""
echo "= installing to $(pwd)"

# If it's a pacman/yaourt based manager it will need base-devel for most operations
# although probably is yet installed
if [ "$pmanager" == "pacman" || "$pmanager" == "yaourt" ]; then
	install linux base-devel
else
	# Basic build tools - make... (eg: needed in sqlite nodejs driver)
	install linux build-essentials
fi

# Check for pkg-config and install if needed
test `which pkg-config` || fetch $PKG_CONFIG --with-internal-glib
require 'pkg-config'

install linux gtk+-3.0
install linux librsvg2-dev

# Check for dependencies that needs to be installed
# Some can be installed right away, others not
install linux git
# Usually correct install is from web page
require node
# Installed with npm
require electron

echo ""
echo "= Finished Installing!"
echo ""
echo "= starting setup"

# Compile app list program
cd install
	./gtkcc.sh listApps
	# By now, just setup for Ubuntu theme
	echo "{\
		\"version\": \"0.1.0\",\
		\"theme\": \"Humanity\",\
		\"db_port\": 42511,\
		\"shortcuts\": {\
			\"launch\": \"Ctrl+Space\"\
		}\
	}" > ../misc/settings.json
cd ..

# Make the launcher
echo "[Desktop Entry]" > TheMutant.desktop
echo "Encoding=UTF-8" >> TheMutant.desktop
echo "Version=1.0" >> TheMutant.desktop
echo "Name=The Mutant" >> TheMutant.desktop
echo "Comment=Efficiency program" >> TheMutant.desktop
echo "Exec=electron $(pwd)" >> TheMutant.desktop
echo "Terminal=false" >> TheMutant.desktop
echo "Type=Application" >> TheMutant.desktop
echo "Categories=Utility;" >> TheMutant.desktop

# Make the launcher startup program
# Make necessary folder
mkdir -p ~/.config/autostart
cp TheMutant.desktop ~/.config/autostart/
# Make it available for menu launchers
# echo "If you want the application to be visible from the menu, move TheMutant.desktop to /usr/share/applications/"
# echo "cp TheMutant.desktop /usr/share/applications"
cp TheMutant.desktop /usr/share/applications

# Clean
[[ -f ./back/listApps ]] && rm ./back/listApps
mv ./install/listApps ./back/listApps
# rm ./TheMutant.desktop

echo ""
echo "= Finished Installing!"
echo ""
