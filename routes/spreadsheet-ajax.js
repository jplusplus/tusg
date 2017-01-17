var router = require('express').Router()
var pug = require('pug')
var settings = require('../settings')
var optParser = require('../lib/opt-parser')

var spreadsheetAjax = function(req, res, next) {
  // Fetch url parameters or defaults
  var options = optParser.parse(req.body, settings.defaults)
  var spreadsheetKey = req.body.key
  var text = req.body.text
  
  var spreadsheet = require("../lib/spreadsheet")({
    language: options.language.selected,
    locale: options.locale.selected,
    software: options.software.selected,
  })
  var opts = {};opts[spreadsheetKey] = true
  spreadsheet.filter(text, opts, function(content){
    res.json(content)
  })

}

module.exports = spreadsheetAjax
