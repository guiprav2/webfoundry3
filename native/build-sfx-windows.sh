#!/bin/sh
x86_64-w64-mingw32-gcc sfx.c -I./mingw-libs/include -L./mingw-libs/lib -static -larchive -lbz2 -o sfx
