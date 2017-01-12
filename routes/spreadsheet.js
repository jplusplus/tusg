var router = require('express').Router()
var textFunctions = require("../lib/text-functions.js")("en-GB")
var formulas = require("../lib/formulas.js")
var optParser = require('../lib/opt-parser')
var settings = require("../settings.js")
var pug = require('pug')
var GoogleSpreadsheet = require('google-spreadsheet')
var async = require('async')

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
          if (cell.formula){
            var formula = formulas.parseString(cell.formula)
            formula = "=" + formulas.format(formula)
          } else {
            var formula = cell.value
          }
          data[row][col] = {
            value: cell.value,
            formula: formula,
            numericValue: cell.numericValue,
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
      })
    },
  ])  // async
}
