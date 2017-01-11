var router = require('express').Router()
var pug = require('pug')
var settings = require('../settings')
var optParser = require('../lib/opt-parser')

var content =  function(req, res, next) {

  var defaults = settings.defaults
  var versions = settings.versions
  var chapters = settings.chapters

  // Fetch url parameters or defaults
  optParser.parse(req.body, defaults)

  // Make sure to use an available version
  // for this software
  var selectedVersion = req.body.version
  if (versions[defaults.software.selected].indexOf(selectedVersion) == -1){
    // Default to latest version
    selectedVersion = versions[defaults.software.selected][0]
  }

  // Force and disable selection of OS for 
  // software limited to one OS
  var forcedOS = optParser.forceParam(defaults.software.selected, settings.forcedOS)
  var activeOS = forcedOS ? forcedOS : defaults.os.selected

  var software = defaults.software.selected
  // Internally treat NeoOffice as OpenOffice (because it is)
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
  formulas.init(software,
                req.body.language,
                req.body.locale,
                function(){
    var chaptersContent = {}
    for (chapter in chapters){
      var slug = chapters[chapter]
      chaptersContent[slug] = pug.renderFile(
        'views/chapters/'+slug+'.pug', {
          software: software,
          os: req.body.activeOS,
          version: req.body.version,
          language: req.body.language,
          locale: req.body.locale,
          f: formulas.formula,
          menu: formulas.menu,
          key: helpers.key,
          filters: {
            image: helpers.image
          }
        }
      )
    }
    res.json(chaptersContent)
  })

}

module.exports = content
