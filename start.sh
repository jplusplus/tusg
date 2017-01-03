#!/bin/bash
APPNAME=tusg
MODE=production

export DEBUG=$APPNAME
export NODE_ENV=$MODE

gulp
node app.js
