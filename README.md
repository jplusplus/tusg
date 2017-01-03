# The Ultimate Spreadsheet Guide

## Getting started

    git clone https://github.com/jplusplus/tusg.git
    cd tusg
    npm install
    ./develop.sh

`develop.sh` will set environment variables to defaults and start the app in development mode. You should now be able to access the site at [localhost:3000](http://localhost:3000)

Each pug file in [`views/chapters`](https://github.com/jplusplus/tusg/tree/master/views/chapters) corresponds to one chapter in the guide. Just edit the pug files, and reload the page.

## Environment variables

 - `export DEBUG=tusg` to enable debug messages
 - `export NODE_ENV=development` to run in development mode, `export NODE_ENV=production` otherwise
