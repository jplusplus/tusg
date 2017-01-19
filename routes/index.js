var router = require('express').Router()
//var textFunctions = require("../lib/text-functions.js")("en-GB")
var pug = require('pug')
var request = require('request')
var settings = require('../settings')
var optParser = require('../lib/opt-parser')

/* GET home page. */
router.get('/', function(req, res, next) {

  var versions = settings.versions
  var chapters = settings.chapters
  var options = req.options
  var software = options.software.selected

  // Make sure to use an available version
  // for this software
  var version = req.query.version
  if (versions[software].indexOf(version) == -1){
    // Default to latest version
    version = versions[software][0]
  }

  // Force and disable selection of OS for 
  // software limited to one OS
  var forcedOS = optParser.forceParam(options.software.selected, settings.forcedOS)
  var activeOS = forcedOS ? forcedOS : options.os.selected
  urlParams = [
  ].join("&")
  var activeLanguage = options.language.selected
  var activeLocale = options.locale.selected

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
          availableSoftwares: options.software.allowed,
          activeSoftware: software,
          availableOS: options.os.allowed,
          activeOS: activeOS,
          lockOS: forcedOS ? true : false,
          availableVersions: versions[software],
          activeVersion: version,
          availableLanguages: options.language.allowed,
          activeLanguage: activeLanguage,
          availableLocales: options.locale.allowed,
          activeLocale: activeLocale,
          chapters: chapters,
          chaptersContent: response.body,
        })
      }
    }
  )

})

module.exports = router
