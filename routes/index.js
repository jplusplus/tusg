var router = require('express').Router()
var textFunctions = require("../lib/text-functions.js")("en-GB")
var pug = require('pug')

/* GET home page. */
router.get('/', function(req, res, next) {

  var defaults = {
    software: {
      allowed: ["Excel for Windows", "Excel for Mac", "Google Sheets", "LibreOffice/OpenOffice", "NeoOffice"],
      default: "Excel for Windows",
    },
    language: {
      allowed: ["English", "Swedish", "Finnish"],
      default: "English"
    },
    locale: {
      allowed: ["sv-SE", "en-US", "en-GB"],
      default: "en-US"
    },
    os: {
      allowed: ["Windows", "MacOS", "Linux"],
      default: "Windows"
    }
  }
  var versions = {
    "Excel for Windows": ["Excel 2016", "Excel 2013", "Excel 2010", "Excel 2007"], 
    "Excel for Mac": ["Excel 2016", "Excel 2015", "Excel 2011", "Excel 2008"],
    "LibreOffice/OpenOffice": ["5.0.0", "4.4.0", "4.3.0", "4.2.0", "4.1.0", "3.6.0"],
    "Google Sheets": [],
    "NeoOffice": ["NeoOffice 2015", "NeoOffice 2014", "NeoOffice 2013", "NeoOffice 3.4"]
  }

  var chapters = {
    "What software should I use?": "chosing-software",
    "Guiding principles": "best-practices",
    "Cleaning up your sheet": "cleaning-up",
  }

  // Fetch url parameters or defaults
  for (var default_ in defaults){
    if (req.query[default_] && (defaults[default_].allowed.indexOf(req.query[default_]) > -1)){
      defaults[default_].selected = req.query[default_]
    } else {
      defaults[default_].selected = defaults[default_].default
    }
  }
  var selectedVersion = req.query.version
  if (versions[defaults.software.selected].indexOf(selectedVersion) == -1){
    // Default to latest version
    selectedVersion = versions[defaults.software.selected][0]
  }

  var selectedOS = defaults.os.selected
  var activeOS = selectedOS
  var lockOS = false
  // Change OS in case of incompatible parameters
  if (defaults.software.selected == "Excel for Windows") {
    activeOS = "Windows"
    lockOS = true
  } else if (defaults.software.selected == "Excel for Mac") {
    activeOS = "MacOS"
    lockOS = true
  } else if (defaults.software.selected == "NeoOffice") {
    activeOS = "MacOS"
    lockOS = true
  }

  var software = defaults.software.selected
  // treat NeoOffice as OpenOffice (because it is)
  if (software == "NeoOffice"){
    software = "LibreOffice/OpenOffice"
    var mapping = {
      "NeoOffice 2015": "3.1.1",
      "NeoOffice 2014": "3.1.1",
      "NeoOffice 2013": "3.1.1",
      "NeoOffice 3.4": "3.1.1",
      "NeoOffice 3.3": "3.1.1",
      "NeoOffice 3.2": "3.1.1",
      "NeoOffice 3.1": "3.1.1",
      "NeoOffice 3.0": "3.0.1",
    }
    var version = mapping[version]
  } else {
    var version = selectedVersion
  }

  // Normalize Excel varietes
  if (software.includes("Excel")) {
    software = "Excel"
  }

  // async module (needs to load i18n data)
  var formulas = require("../lib/formulas.js")
  var helpers = require("../lib/helpers.js")(activeOS)
  formulas.init(defaults.language.selected, software, function(){
    var chaptersContent = {}
    for (chapter in chapters){
      var slug = chapters[chapter]
      chaptersContent[slug] = pug.renderFile(
        'views/chapters/'+slug+'.pug', {
          software: software,
          os: activeOS,
          version: version,
          language: defaults.language.selected,
          locale: defaults.locale.selected,
          f: formulas.formula,
          menu: formulas.menu,
          key: helpers.key,
          filters: {
            image: helpers.image
          }
        }
      )
    }

    res.render('index', {
      lang: "en",
      availableSoftwares: defaults.software.allowed,
      activeSoftware: defaults.software.selected,
      availableOS: defaults.os.allowed,
      activeOS: activeOS,
      selectedOS: selectedOS,
      lockOS: lockOS,
      availableVersions: versions[defaults.software.selected],
      activeVersion: selectedVersion,
      availableLanguages: defaults.language.allowed,
      activeLanguage: defaults.language.selected,
      availableLocales: defaults.locale.allowed,
      activeLocale: defaults.locale.selected,
      chapters: chapters,
      chaptersContent: chaptersContent,
    })

  })

})

module.exports = router
