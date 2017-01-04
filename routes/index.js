var router = require('express').Router()
//var textFunctions = require("../lib/text-functions.js")("en-GB")
var pug = require('pug')
var request = require('request')
var settings = require('../settings')
var optParser = require('../lib/opt-parser')

/* GET home page. */
router.get('/', function(req, res, next) {

  var defaults = settings.defaults
  var versions = settings.versions
  var chapters = settings.chapters

  // Fetch url parameters or defaults
  optParser.parse(req.query, defaults)

  // Make sure to use an available version
  // for this software
  var selectedVersion = req.query.version
  if (versions[defaults.software.selected].indexOf(selectedVersion) == -1){
    // Default to latest version
    selectedVersion = versions[defaults.software.selected][0]
  }

  // Force and disable selection of OS for 
  // software limited to one OS
  var forcedOS = optParser.forceParam(defaults.software.selected, settings.forcedOS)
  var activeOS = forcedOS ? forcedOS : defaults.os.selected
  urlParams = [
  ].join("&")

  var port = process.env.PORT || 3000
  request.post({
      url: "http://localhost:"+port+"/content",
      json: true,
      body: {
        language: defaults.language.selected
      },
      'content-type': 'application/json',
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.render('index', {
          lang: "en",
          availableSoftwares: defaults.software.allowed,
          activeSoftware: defaults.software.selected,
          availableOS: defaults.os.allowed,
          activeOS: activeOS,
          lockOS: forcedOS ? true : false,
          availableVersions: versions[defaults.software.selected],
          activeVersion: selectedVersion,
          availableLanguages: defaults.language.allowed,
          activeLanguage: defaults.language.selected,
          availableLocales: defaults.locale.allowed,
          activeLocale: defaults.locale.selected,
          chapters: chapters,
          chaptersContent: response.body,
        })
      }
    }
  )

})

module.exports = router
