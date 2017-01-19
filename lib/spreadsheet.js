var memjs = require('memjs')
var cache = memjs.Client.create()

var router = require('express').Router()
var formulas = require("../lib/formulas.js")
var settings = require("../settings")
var pug = require('pug')
var GoogleSpreadsheet = require('google-spreadsheet')
var async = require('async')
var textFunctions

module.exports = function(options){
  var spreadsheet = {}
  spreadsheet.options = options

  /* Filter function for PUG templates. Use like this:
   :spreadsheet(SPREADSHEETS-ID)
  */
  spreadsheet.filter = function(text, filterOptions, cb){

    var key = Object.keys(filterOptions)[0]
    if (Object.keys(filterOptions).length > 1 && Object.keys(filterOptions)[1] === "bad"){
      var class_ = "bad"
    } else {
      var class_ = null
    }
    var doc = new GoogleSpreadsheet(key)

    var cells // data from Google Sheets
    var data = [] // parsed data
    var numcols = 0 // last column with a value

    async.waterfall([
      function getCache(step){
        cache.get(key, function(err, val) {
          if (err){
            console.log("MemCachier error:", err)
          } else {
            cells = val ? JSON.parse(val.toString()) : null
          }
          step()
        })
      },
      function setAuth(step) {
        if (cells){
          // skip if already fetched from cache
          step()
          return
        }
        var creds = {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY
        }
        doc.useServiceAccountAuth(creds, step)
      },
      function getData(step) {
        var step = step
        if (cells){
          // skip if already fetched from cache
          step()
          return
        }
        doc.getInfo(function(err, info) {
          if (err || (typeof info == "undefined")){
            console.log("Failed to load spreadsheet", err)
            return("Failed to load spreadsheet")
          }
          sheet = info.worksheets[0]
          sheet.getCells({
            'min-row': 1,
            'max-row': 20,
            'return-empty': true
          }, function( err, c ){
            cells = c
            cache.set(key, JSON.stringify(cells), function(err){
              if (err) {
                console.log("Failed setting cache: ", err)
              }
              step()
            })
          })
        })
      },
      function getHelpers(step){
        var step = step
        textFunctions = require("../lib/text-functions.js")(settings.locales[spreadsheet.options.locale])
        formulas.init(spreadsheet.options.software,
                      spreadsheet.options.language,
                      spreadsheet.options.locale,
                      function(err){
                        if (err){
                          console.log("Failed to init formulas in spreadsheet.js:", err)
                        }
                        step()
                      })
      },
      function parseData(step) {

        for (let cell of cells) {
          row = cell.row - 1
          col = cell.col - 1

          if (!(row in data)){
            data[row] = []
          }

          // Set defaults for cell 
          var value = cell.value
          var cellClass = "text"
          // Localize numerical value
          if (typeof cell.numericValue !== "undefined"){
            value = textFunctions.number(cell.numericValue, 9)
            cellClass = "number"
          }
          // Localize reserved words
          if (["TRUE", "FALSE"].indexOf(value) > -1){
            value = formulas.t(value)
            cellClass = "boolean"
          }
          // Localize error messages
          if (value[0] === "#"){
            value = formulas.t(value)
            cellClass = "error"
          }
          // Parse and localize formulas
          if (cell.formula){
            var formula = formulas.parseString(cell.formula)
            if (formula){
              formula = "=" + formulas.format(formula, col, row)
            } else {
              console.log("Failed to parse formula: ", cell.formula)
              formula = cell.formula
            }
          } else {
            var formula = value
          }
          // Data
          data[row][col] = {
            value: value,
            formula: formula,
            class: cellClass
          }
          if (cell.value){
            numcols = Math.max(numcols, col)
          }
        }
        step()
      },
      function render(step){
        columnHeaders = Array.from(" ".repeat(numcols+1))
        columnHeaders.forEach(function(el, index, array){
          array[index] = String.fromCharCode(65 + index)
        })
        data.forEach(function(el, index, array){
          array[index] = el.slice(0, numcols+1)
        })
        var html = pug.renderFile("views/includes/spreadsheet.pug", {
          data: data,
          cols: columnHeaders,
          classes: spreadsheet.options.software.split("/")[0].replace(" ","_").toLowerCase()
            + (class_ ? " " + class_ : ""),
        })
        html = "<figure>" + html
        if (text){
          html += '<figcaption>'+text+'</figcaption>'
        }
        html += "</figure>"
        step(html)
      }
    ],
    function(result){
      cb(result)
    })  // async

  } //filter()

  return spreadsheet

}