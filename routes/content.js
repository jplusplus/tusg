var router = require('express').Router()
var pug = require('pug')
var settings = require('../settings')
var optParser = require('../lib/opt-parser')

var content =  function(req, res, next) {

  var chapters = settings.chapters
  var reqOptions = req.options

  // Force and disable selection of OS for 
  // software limited to one OS
  var forcedOS = optParser.forceParam(reqOptions.software, settings.forcedOS)
  var activeOS = forcedOS ? forcedOS : reqOptions.os

  var language = reqOptions.language
  var locale = reqOptions.locale
  var software = reqOptions.software
  var version = reqOptions.version

  // async module (needs to load i18n data)
  var formulas = require("../lib/formulas.js")
  var helpers = require("../lib/helpers.js")(activeOS)
  formulas.init(software,
                language,
                locale,
                function(err, formulasInstance){
    if (err){
      console.log("Failed to init formulas ", err)
      return
    }
    var chaptersContent = {}
    var totalSpreadsheets = 0
    for (chapter in chapters){
      var slug = chapters[chapter]
      chaptersContent[slug] = pug.renderFile(
        'views/chapters/'+slug+'.pug', {
          software: software,
          os: activeOS,
          version: version,
          language: language,
          locale: locale,
          t: formulas.t,
          f: function(str){
            var formula = formulasInstance.parseString(str)
            if (formula){
              formula = "=" + formulasInstance.format(formula, 1, 1)
            } else {
              console.log("Failed to parse formula: ", str)
              formula = str
            }
            return "<code class='formula selectonclick'>"+formula+"</code>"
          },
          menu: formulasInstance.menu,
          key: helpers.key,
          filters: {
            image: helpers.image,
            spreadsheet: function(text, options){
              totalSpreadsheets++;
              return "<div class='replaceWithSpreadsheet jsonly'" +
                     " data-num='" + totalSpreadsheets + "'" +
                     " data-text='" + text + "'" +
                     " data-key='" + Object.keys(options)[0] + "'>" +
                     "Loading spreadsheet ...</div><noscript>You need Javascript enabled to see this illustration</noscript>"
             },
          },
        }
      )
    }
    res.json(chaptersContent)
  })

}

module.exports = content
