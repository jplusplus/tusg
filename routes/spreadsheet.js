var router = require('express').Router()
var textFunctions = require("../lib/text-functions.js")("en-GB")
var pug = require('pug')
var GoogleSpreadsheet = require('google-spreadsheet')
var async = require('async')

/* GET home page. */
router.get('/', function(req, res, next) {

  var spreadsheetKey = req.query.key
  var doc = new GoogleSpreadsheet(spreadsheetKey)

  async.series([
    function setAuth(step) {
      var creds = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY
      }

      doc.useServiceAccountAuth(creds, step);
    },
    function getInfoAndWorksheets(step) {
      doc.getInfo(function(err, info) {
        console.log('Loaded doc: '+info.title+' by '+info.author.email);
        sheet = info.worksheets[0];
        console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
        step();
      });
    },
  ])  // async
})