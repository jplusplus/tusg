# The Ultimate Spreadsheet Guide
This is a dynamic spreadsheet guide for journalists. It contains the everyday skills needed in a newsroom, adopted to your platform, software version and language. Live demo: https://tusg.herokuapp.com

## Installation

To install:

    git clone https://github.com/jplusplus/tusg.git
    cd tusg
    npm install

Optionally, to make the Google Sheets integration work, you will also need to add a API key and either Memcached or MemCachier.
 - Get an API key (json format with line breaks, and explicit `=`'s) for your Google Drive service account (see [this guide](https://github.com/theoephraim/node-google-spreadsheet#user-content-service-account-recommended-method) for step by step insctuctions on how to do this).
 - Open the downloaded json file, and copy the private key to a separate text file.
 - Replace `\n` with actual line breaks.
 - Replace `\u003d` with `=`
 - `export GOOGLE_PRIVATE_KEY="$(cat google_private_key.txt)"`
 - `export GOOGLE_CLIENT_EMAIL=yourserviceaccountemail@google.com`
 - `apt-get install memcached` (Ubuntu) or `brew install memcached` (OS X) to install Memcached.
 - `export MEMCACHIER_SERVERS=127.0.0.1:11211` (depending on your server setup. This is the defult for many systems) to set the Memcached server.

## Developing

To get started:

    gulp develop

`gulp develop` will set environment variables to defaults and start the app in development mode. You should now be able to access the site at [localhost:3000](http://localhost:3000)

Each pug file in [`views/chapters`](https://github.com/jplusplus/tusg/tree/master/views/chapters) corresponds to one chapter in the guide. Just edit the pug files, and reload the page.

In your chapter files, you can access a number of variables and helper functions, e.g.:

### Variables

These are accessed like this:

```pug
    if os == "MacOS"
      p Character encoding can sometimes be an issue when importing CSV files.
```

or inline like this:

```pug
    p The bitwise AND function is written #{version < "Excel 2013" ? "with an ugly hack using SUBSTITUTE" : "BITAND"} in Excel.
```

* `os`: Operating system, e.g. `Windows`.
* `software`: E.g. `Excel`.
* `version`: E.g. `Excel 2010`
* `language`: Interface language for the software, e.g. `Swedish`
* `locale`: Locale settings for the workbook, e.g. `sv-SE`. 

### Functions

These are accessed like this: `!{f()}`, eg:

```pug
    p Use the function !{f("=MID()")} to extract a substring from a string, like this: !{f('=MID(A1, FIND("-", A1), 6)')}.
```

* `f()`: Translates a spreadsheet function, and uses the right argument delimiter (comma och semicolon). E.g. `!{f("=LEFT(A1, 4)")}` => `=VÄNSTER(A1; 4)`
* `t()`: Translates a localized string. E.g. `!{t("TRUE")}` => `SANT`
* `menu()`: Translates an option or a menu path, and formats is like nicely. E.g. `!{menu("Format", "Cells")}` => `Formatera > Celler`
* `key()`: Translates keyboard shortcut to the current OS. E.g. `!{key("Ctrl", "A")}` => `⌘-A`

### Filters

These are accessed like this: `:image(name.png)`, eg:

```pug
    :image(spreadsheet.png)
      Here goes a caption to that image
```

 * `image(filename.png)`: Embeds an image from the `/public/img` folder. Use `small` as the second argument to inline a smaller, floating image. If the filename contains a comma you will have to enclose it in quotes.
 * `spreadsheet(KEY)`: Embeds an interactive spreadsheet, based on a Google Sheets identified by KEY, but localized.

## Environment variables

 - `export DEBUG=tusg` to enable debug messages
 - `export NODE_ENV=development` to run in development mode, `export NODE_ENV=production` otherwise

To enable Google Sheets integration:
 - `export GOOGLE_PRIVATE_KEY="$(cat google_private_key.txt)"` private API key (json format with line breaks, and explicit `=`'s) for your Google Drive service account (see [this guide](https://github.com/theoephraim/node-google-spreadsheet#user-content-service-account-recommended-method) for step by step insctuctions on how to do this).
 - `export GOOGLE_CLIENT_EMAIL=yourserviceaccountemail@google.com`
 - `export MEMCACHIER_SERVERS=127.0.0.1:11211`
 
For Heroku, the corresponding commands would be:
 - `heroku config:add DEBUG=tusg`
 - `heroku config:add NODE_ENV=production`
 - `heroku config:add GOOGLE_PRIVATE_KEY="$(cat google_private_key.txt)"`
 - `heroku config:add GOOGLE_CLIENT_EMAIL=yourserviceaccountemail@google.com`
 - `heroku config:add MEMCACHIER_SERVERS=127.0.0.1:11211`
 
## Changelog

* 0.0.1: First version