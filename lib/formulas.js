var csv = require("fast-csv")
var Intl = require("intl")

var formulas = {}

formulas.cache = {}
formulas.menuCache = {}

function whatDecimalSeparator(locale) {
  var localizer = new Intl.NumberFormat(locale)
  return localizer.format(1.1).substring(1, 2)
}

/* Load i18n data
*/
formulas.init = function(software, language, locale, callback){
  var self = this
  self.language = language
  self.software = software
  self.locale = locale
  if (software == "LibreOffice/OpenOffice"){
    self.sep = ","
  } else {
    if (whatDecimalSeparator(locale) === "."){
      self.sep = ","
    } else {
      self.sep = ";"
    }
  }
  csv
   .fromPath(__dirname + "/formulas/i18n.csv", {headers: true})
   .on("data", function(data){
      var en = data.English
      self.cache[en] = data
   })
   .on("end", function(){
      csv
       .fromPath(__dirname + "/formulas/menus-i18n.csv", {headers: true})
       .on("data", function(data){
          var en = data.English
          self.menuCache[en] = data
       })
       .on("end", function(){
          callback(self)
       })
   })
}

/* Return the localized name of a formula
*/
formulas.getLocalName = function(generic){
  var generic = generic.toUpperCase().trim()
  if (this.cache){
    if ((generic in this.cache) && (this.cache[generic][this.language])){
      return this.cache[generic][this.language]
    } else {
      return generic
    }
  } else {
    console.log("No cached formulas. This can't possibly happen.")
  }
}

/* Format a formula for output.
   Use like !{formula("split", "A1", "C3")}
*/
formulas.formula = function() {
  var args = [...arguments]
  var formulaName=args.shift()
  if (formulas.software == "Google Sheets"){
    var localName = formulaName.toUpperCase()
  } else {
    var localName = formulas.getLocalName(formulaName)
  }
  var html = "<code class='formula selectonclick'>="+localName+"("+args.join(formulas.sep+" ")+")</code>"
  return html
}

/* Return the localized name of a software string
*/
formulas.getLocalMenu = function(generic){
  var generic = generic.trim()
  if (this.menuCache){
    if ((generic in this.menuCache) && (this.menuCache[generic][this.language])){
      return this.menuCache[generic][this.language]
    } else {
      return generic
    }
  } else {
    console.log("No cached formulas. This can't possibly happen.")
  }
}

/* Format a formula for output.
   Use like !{menu("Format", "Cells")}
*/
formulas.menu = function() {
  var parts = []
  for (arg in arguments){
    parts.push(formulas.getLocalMenu(arguments[arg]))
  }
  var html = "<code class='menuOpts'>"+parts.join(" > ")+"</code>"
  return html
}

module.exports = formulas
