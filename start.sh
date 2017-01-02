#!/bin/bash
APPNAME=tusg
MODE=development
#MODE=production

export DEBUG=$APPNAME
export NODE_ENV=$MODE

gulp && gulp watch &
nodemon
x-www-browser http://localhost:3000
