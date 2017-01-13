var csv = require("fast-csv")
var Intl = require("intl")

var formulas = {}

formulas.cache = {}
formulas.menuCache = {}

function whatDecimalSeparator(locale) {
  var localizer = new Intl.NumberFormat(locale)
  return localizer.format(1.1).substring(1, 2)
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/* Represents an spreadsheet formula
   `formula` is the generic formula name
   `args` is an array of arguments, that could be either
   numbers, strings or formulas */
class Formula {
  constructor(formula, args) {
    this.formula = formula.toUpperCase().trim();
    this.args = args;
  }
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
   .fromPath(__dirname + "/i18n/formulas.csv", {headers: true})
   .on("data", function(data){
      var en = data.English
      self.cache[en] = data
   })
   .on("end", function(){
      csv
       .fromPath(__dirname + "/i18n/common.csv", {headers: true})
       .on("data", function(data){
          var en = data.English
          self.menuCache[en] = data
       })
       .on("end", function(){
          callback(self)
       })
   })
}

/* Try to parse a string, and return a formula object.
   E.g. =SUM(SUM(1, 2), 3)
 */
formulas.parseString = function(string){
  var regex = new RegExp(/(?:=|^)([A-Z][A-Z0-9]+)\((.*)\)/)
  var matches = regex.exec(string)
  if ((!matches) || matches.length < 2){
    return null
  }
  var formula = matches[1]
  var args = matches[2]

  /* Match:
  1. "abc123"; "s"&"b"
  2. R[0]C[-1]; R2C3; R2C3:R[1]C[-3]; C1C1
  3. 3.14; 2+3
  4. TRUE/FALSE 
  5. SUM(2, 3)
  ... all followed by end of string or comma
  */
  // FIXME: Why cant we start with (?:,|^)
  // Note the order in (?:,|^). ^ Must come last, to be next to the following char
  var regexStr = /(("[^"]+"((\s+)?&(\s+)?("[^"]+")){0,99})|(([CR](?:\[-?)?\d+\]?\:?[CR](?:\[-?)?\d+\]?)(:[CR](?:\[-?)?\d+\]?[CR](?:\[-?)?\d+\]?)?)|([\d\.\+\/\-\*\s]+)|(TRUE|FALSE)|([A-Z][A-Z0-9]+\(.*\))|(\w+))(\s+)?(?:$|,)/g
//  var regexStr = /(?:(,(\s+)?)|^)(.+)(\s+)?(?:$|,)/g
  var parsedArgs = []
  args.replace(regexStr, function(m) {
    // Match SUM(SUM(1,2),3)
    if (/[A-Z][A-Z0-9]+\(.*\)/.exec(m)){
      parsedArgs.push(formulas.parseString(m))
    } else {
      // trimming out commas
      parsedArgs.push(m.replace(/^[,\s]+|[,\s]+$/g, "").trim())
    }
  })

  return new Formula(formula, parsedArgs)

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

/* Create a full, localized string from a formulaObject, eg:
       =SUMMA(A1, A2)
   Could be a nested function
*/
formulas.format = function(formulaObj){
  var localName = formulas.getLocalName(formulaObj.formula)
  var parts = []
  for (var arg of formulaObj.args){
    if (typeof arg == "object"){
      parts.push(formulas.format(arg))
    } else {
      // Translate reserved words
      if (["TRUE", "FALSE"].indexOf(arg) > -1){
        arg = formulas.t(arg)
      }
      // Format numerical values
      if (isNumeric(arg)){
        var localizer = new Intl.NumberFormat(formulas.locale)
        arg = localizer.format(arg)
      }
      parts.push(arg)
    }
  }
  return localName+"("+parts.join(formulas.sep+" ")+")"

}

/* Format a formula for output.
   Use like !{formula("split", "A1", "C3")}
*/
formulas.formula = function() {
  var args = [...arguments]
  var formulaName=args.shift()
  var obj = new Formula(formulaName, args)
  var html = "<code class='formula selectonclick'>="+formulas.format(obj)+"</code>"
  return html
}

/* Return the localized name of a software string
*/
formulas.t = function(generic){
  var generic = generic.trim()
  if (this.menuCache){
    if ((generic in this.menuCache) && (this.menuCache[generic][this.language])){
      return this.menuCache[generic][this.language]
    } else {
      return generic
    }
  } else {
    console.log("No cached translations. This can't possibly happen.")
  }
}

/* Format a formula for output.
   Use like !{menu("Format", "Cells")}
*/
formulas.menu = function() {
  var parts = []
  for (arg in arguments){
    parts.push(formulas.t(arguments[arg]))
  }
  var html = "<code class='menuOpts'>"+parts.join(" > ")+"</code>"
  return html
}

module.exports = formulas
