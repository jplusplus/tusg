# The Ultimate Spreadsheet Guide
This is a dynamic spreadsheet guide for journalists. It contains the everyday skills needed in a newsroom, adopted to your platform, software version and language. Live demo: https://tusg.herokuapp.com

## Getting started

    git clone https://github.com/jplusplus/tusg.git
    cd tusg
    npm install
    ./develop.sh

`develop.sh` will set environment variables to defaults and start the app in development mode. You should now be able to access the site at [localhost:3000](http://localhost:3000)

Each pug file in [`views/chapters`](https://github.com/jplusplus/tusg/tree/master/views/chapters) corresponds to one chapter in the guide. Just edit the pug files, and reload the page.

In your chapter files, you can access a number of variables and helper functions, e.g.:

### Variables

These are accessed like this: `#{os}`, eg:

```pug
    if os == "MacOS"
      p Character encoding can sometimes be an issue when importing CSV files.
```

* `os`: Operating system, e.g. `Windows`.
* `software`: E.g. `Excel`.
* `version`: E.g. `Excel 2010`
* `language`: Interface language for the software, e.g. `Swedish`
* `locale`: Locale settings for the workbook, e.g. `sv-SE`. Mostly relevant for Google Sheets, where argument delimiter differ by locale.

### Functions

These are accessed like this: `!{f()}`, eg:

```pug
    p Use the function !{f("mid")} to extract a substring from a string, like this: !{f("mid", A1, 2, 6)}.
```

* `f()`: Translates a spreadsheet function when needed (for Excel in other languages than English), and uses the right argument delimiter (comma och semicolon). First argument is the English name of the function, and the rest is treated like arguments to that function. E.g. `!{f("left", A1, 4)}` => `=VÄNSTER(A1; 4)`
* `menu()`: Translates a menu path, and formats is like nicely. E.g. `!{menu("Format", "Cells")}` => `Formatera > Celler`
* `key()`: Translates keyboard shortcut to the current OS. E.g. `!{key("Ctrl", "A")}` => `⌘-A`

### Filters

These are accessed like this: `:image(name.png)`, eg:

```pug
    :image(spreadsheet.png)
      Here goes a caption to that image
```

 * `image()`: Embeds an image from the `/public/img` folder. Use `small` as the second argument to inline a smaller, floating image. 


## Environment variables

 - `export DEBUG=tusg` to enable debug messages
 - `export NODE_ENV=development` to run in development mode, `export NODE_ENV=production` otherwise
