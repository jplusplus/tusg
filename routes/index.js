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
  var options = optParser.parse(req.query, defaults)
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
  var forcedOS = optParser.forceParam(defaults.software.selected, settings.forcedOS)
  var activeOS = forcedOS ? forcedOS : defaults.os.selected
  urlParams = [
  ].join("&")

  var port = process.env.PORT || 3000
  request.post({
      url: "http://localhost:"+port+"/content",
      json: true,
      body: {
        language: defaults.language.selected,
        locale: defaults.locale.selected,
      },
      'content-type': 'application/json',
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.render('index', {
          lang: "en",
          availableSoftwares: defaults.software.allowed,
          activeSoftware: software,
          availableOS: defaults.os.allowed,
          activeOS: activeOS,
          lockOS: forcedOS ? true : false,
          availableVersions: versions[software],
          activeVersion: version,
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
