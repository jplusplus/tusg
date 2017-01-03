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
      allowed: ["English", "Swedish"],
      default: "English"
    },
    locale: {
      allowed: ["sv-SE", "en-US", "en-GB"],
      default: "en-US"
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

  for (var default_ in defaults){
    if (req.query[default_] && (defaults[default_].allowed.indexOf(req.query[default_]) > -1)){
      defaults[default_].selected = req.query[default_]
    } else {
      defaults[default_].selected = defaults[default_].default
    }
  }

  if (defaults.software.selected == "Excel for Windows") {
    var activeOS = "Windows"
  } else if (defaults.software.selected == "Excel for Mac") {
    var activeOS = "MacOS"
  } else if (defaults.software.selected == "NeoOffice") {
    var activeOS = "MacOS"
  } else {
    var activeOS = null
  }

  // async module (needs to load i18n data)
  var formulas = require("../lib/formulas.js")
  formulas.init(defaults.language.selected, function(){
    var chaptersContent = {}
    for (chapter in chapters){
      var slug = chapters[chapter]
      chaptersContent[slug] = pug.renderFile(
        'views/chapters/'+slug+'.pug', {
          software: defaults.software.selected,
          os: activeOS,
          version: versions[defaults.software.selected].selected,
          language: defaults.language.selected,
          locale: defaults.locale.selected,
          f: formulas.formula,
          filters: {
            // :image(filenamn)
            //   [Caption]
            image: function(text, options){
              var filename = Object.keys(options)[0]
              var html = '<figure>'
              html += '<img src="/img/'+filename+'">'
              if (text){
                html += '<figcaption>'+text+'</figcaption>'
              }
              html += '</figure>'
              return html
            }
          }
        }
      )
    }

    res.render('index', {
      lang: "en",
      availableSoftwares: defaults.software.allowed,
      activeSoftware: defaults.software.selected,
      activeOS: activeOS,
      availableVersions: versions[defaults.software.selected],
      activeVersion: versions[defaults.software.selected].selected,
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
