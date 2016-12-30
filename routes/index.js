var router = require('express').Router()
var textFunctions = require("../lib/text-functions.js")("sv-SE")

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', {
    lang: "en",
    software: "Excel",
    os: "Windows",
    ver: 16,
    softwareLang: "sv",
    spreadsheetLang: "sv"  // mostly relevant for Google Sheets
  })

})

module.exports = router
