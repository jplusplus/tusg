var router = require('express').Router()
//var textFunctions = require("../lib/text-functions.js")("en-GB")
var pug = require('pug')
var request = require('request')
var settings = require('../settings')
var optParser = require('../lib/opt-parser')

/* GET home page. */
router.get('/', function(req, res, next) {

  var chapters = settings.chapters
  var selectedOptions = req.selectedOptions
  var options = req.options

  // Force and disable selection of OS for 
  // software limited to one OS
  var forcedOS = optParser.forceParam(selectedOptions.software, settings.forcedOS)
  var activeOS = forcedOS ? forcedOS : options.os
  urlParams = [
  ].join("&")
  var activeLanguage = options.language
  var activeLocale = options.locale

  var port = process.env.PORT || 3000
  request.post({
      url: "http://localhost:"+port+"/content",
      json: true,
      body: {
        language: activeLanguage,
        locale: activeLocale,
      },
      'content-type': 'application/json',
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.render('index', {
          lang: "en",
          availableSoftwares: settings.defaults.software.allowed,
          activeSoftware: selectedOptions.software,
          availableOS: settings.defaults.os.allowed,
          activeOS: activeOS,
          lockOS: forcedOS ? true : false,
          availableVersions: settings.versions[selectedOptions.software],
          activeVersion: options.version,
          availableLanguages: settings.defaults.language.allowed,
          activeLanguage: activeLanguage,
          availableLocales: settings.defaults.locale.allowed,
          activeLocale: activeLocale,
          chapters: chapters,
          chaptersContent: response.body,
        })
      }
    }
  )

})

module.exports = router
