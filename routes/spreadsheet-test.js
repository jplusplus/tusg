var router = require('express').Router()
var pug = require('pug')
var optParser = require('../lib/opt-parser')
var settings = require("../settings.js")

/* GET home page. */
module.exports = function(req, res, next) {

  // Fetch url parameters or defaults
  var spreadsheetKey = req.query.key
  var options = optParser.parse(req.query, settings.defaults)

  var spreadsheet = require("../lib/spreadsheet")({
    language: options.language.selected,
    locale: options.locale.selected,
    software: options.software.selected,
  })

  var totalSpreadsheets = 0
  var renderedSpreadsheets = 0
  var spreadsheets = {}
  var filterCb = function(spreadsheetHtml){
    renderedSpreadsheets++
    spreadsheets[renderedSpreadsheets] = spreadsheetHtml

  }

  var renderFn = pug.compileFile("views/spreadsheet.pug", {
    filters: {
      spreadsheet: function(text, options){
        totalSpreadsheets++
        var html = spreadsheet.filter(text, options, filterCb)
        return "<div class='replaceWithSpreadsheet' data-num='" + totalSpreadsheets + "'>¤SPREADSHEET"+totalSpreadsheets+"</div>"
      },
    },
  })

  // Check to see if all spreadsheets are generated yet
  var timeout = 100
  function checkStatus() {
    if (totalSpreadsheets == renderedSpreadsheets){
      clearTimeout(timer)
      var html = renderFn()
      for (let ss in spreadsheets){
        html = html.replace("¤SPREADSHEET" + ss, spreadsheets[ss])
      }
      res.end(html)
    } else {
      tid = setTimeout(checkStatus, timeout);
    }
  }
  var timer = setTimeout(checkStatus, timeout)

  console.log()
}
