var router = require('express').Router()
var formulas = require("../lib/formulas.js")
var optParser = require('../lib/opt-parser')
var settings = require("../settings.js")
var pug = require('pug')
var GoogleSpreadsheet = require('google-spreadsheet')
var async = require('async')
var textFunctions

/* GET home page. */
module.exports = function(req, res, next) {

  // Fetch url parameters or defaults
  var defaults = settings.defaults
  optParser.parse(req.query, settings.defaults)

  var spreadsheetKey = req.query.key
  var doc = new GoogleSpreadsheet(spreadsheetKey)

  var sheet
  var data = []
  var numcols = 0 // last column with a value

  async.series([
    function setAuth(step) {
      var creds = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY
      }
      doc.useServiceAccountAuth(creds, step)
    },
    function getInfoAndWorksheets(step) {
      doc.getInfo(function(err, info) {
        if (err || (typeof info == "undefined")){
          var error = new Error("Failed to load spreadsheet")
          error.status = 501
          next(error)
          return
        }
        sheet = info.worksheets[0]
        step()
      })
    },
    function getHelpers(step){
      var step = step
      textFunctions = require("../lib/text-functions.js")(defaults.locale.selected)

      formulas.init(defaults.software.selected,
                  defaults.language.selected,
                  defaults.locale.selected, function(){
                    step()
                  })
    },
    function getRows(step) {
      sheet.getCells({
        'min-row': 1,
        'max-row': 20,
        'return-empty': true
      }, function( err, cells ){
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
              // TODO: translate references
              // 
              // TODO: hilight references cells
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
      })
    },
    function render(step){
      columnHeaders = Array.from(" ".repeat(numcols+1))
      columnHeaders.forEach(function(el, index, array){
        array[index] = String.fromCharCode(65 + index)
      })
      data.forEach(function(el, index, array){
        array[index] = el.slice(0, numcols+1)
      })
      res.render("spreadsheet", {
        data: data,
        cols: columnHeaders,
        softwareClass: defaults.software.selected.split("/")[0].replace(" ","_").toLowerCase()
      })
    },
  ])  // async
}
