#!/bin/bash

# usage: gtkcc.sh <filename>
filename="$1"; shift
if [ -z "${filename}" ]; then echo "Usage: $0 <filename>"; exit 255; fi
if [ ! -f "${filename}.c" ]; then echo "Cannot find ${filename}.c"; exit 255; fi

gtkCFLAGS="$(pkg-config --cflags gtk+-3.0)"
gtkLDFLAGS="$(pkg-config --libs gtk+-3.0)"

cmd="g++ ${gtkCFLAGS} -std=c++11 -o \"${filename}\" \"${filename}.c\" ${gtkLDFLAGS}"
eval $cmd
