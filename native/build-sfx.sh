#!/bin/sh
musl-gcc sfx.c -I./musl-libs/include -L./musl-libs/lib -static -larchive -lbz2 -o sfx
