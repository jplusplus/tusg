#!/bin/bash
APPNAME=tusg
MODE=development

export DEBUG=$APPNAME
export NODE_ENV=$MODE

gulp && gulp watch &
nodemon
x-www-browser http://localhost:3000
