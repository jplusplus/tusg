var router = require('express').Router()
var textFunctions = require("../lib/text-functions.js")("sv-SE")

/* GET home page. */
router.get('/', function(req, res, next) {

  var defaults = {
    software: {
      allowed: ["Excel", "Google Sheets", "LibreOffice/OpenOffice"],
      default: "Excel",
    }
  }

  for (var default_ in defaults){
    if (req.query[default_] && (defaults[default_].allowed.indexOf(req.query[default_]) > -1)){
      defaults[default_].selected = req.query[default_]
    } else {
      defaults[default_].selected = defaults[default_].default
    }
  }


  res.render('index', {
    lang: "en",
    availableSoftwares: defaults.software.allowed,
    activeSoftware: defaults.software.selected,
    os: "Windows",
    ver: 16,
    softwareLang: "sv",
    spreadsheetLang: "sv"  // mostly relevant for Google Sheets
  })

})

module.exports = router
