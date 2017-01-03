#!/bin/bash
APPNAME=tusg
MODE=development

export DEBUG=$APPNAME
export NODE_ENV=$MODE

gulp && gulp watch &
nodemon -e js,pug --debug
x-www-browser http://localhost:3000
