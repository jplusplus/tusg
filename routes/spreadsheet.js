var router = require('express').Router()
var textFunctions = require("../lib/text-functions.js")("en-GB")
var pug = require('pug')
var GoogleSpreadsheet = require('google-spreadsheet')
var async = require('async')

/* GET home page. */
module.exports = function(req, res, next) {

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
        console.log('Loaded doc: '+info.title)
        sheet = info.worksheets[0]
        console.log('sheet 1: '+sheet.title)
        step()
      })
    },
    function workingWithRows(step) {
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
          data[row][col] = {
            value: cell.value,
            formula: cell.formula
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
