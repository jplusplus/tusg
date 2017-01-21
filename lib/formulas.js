var csv = require("fast-csv")
var Intl = require("intl")
var settings = require("../settings")

var formulas = {}

formulas.formulaCache = {}
formulas.stringChache = {}

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
    if (typeof formula === "undefined"){
      this.formula = null
    } else {
      this.formula = formula.toUpperCase().trim()
    }
    this.args = args;
  }
}

/* Load i18n data
*/
formulas.init = function(software, language, locale, callback){
  var self = this
  self.language = language
  self.software = software
  self.locale = settings.locales[locale]
  if (self.software === "LibreOffice/OpenOffice"){
    self.sep = ","
  } else {
    if (whatDecimalSeparator(self.locale) === "."){
      self.sep = ","
    } else {
      self.sep = ";"
    }
  }
  csv
   .fromPath(__dirname + "/i18n/formulas.csv", {headers: true})
   .on("data", function(data){
      var en = data.English
      delete data.description
      self.formulaCache[en] = data
   })
   .on("end", function(){
      csv
       .fromPath(__dirname + "/i18n/common.csv", {headers: true})
       .on("data", function(data){
          var en = data.English.toString()
          self.stringChache[en] = data
       })
       .on("end", function(err){
          callback(null, self)
       })
       .on("error", function(err){
          callback(err, self)
       })
   })
}

/* Try to parse a string, and return a formula object.
   E.g. =SUM(SUM(1, 2), 3); =1&A2
   We will do this in three steps:
   1. Get formula name (if any)
   2. Get arguments, delimited by comma
   3. Get atoms of arguments, e.g.
      nested formulas, values, etc.
 */
formulas.parseString = function(string){
  /* Match formula (name, arguments) in
   =PI() => PI, []
   =SUM(1, 2) => SUM, [1,2]
   SUM(1, 2) => SUM, [1,2]
   =(2+3) => undefined, [2+3]
  */
  var formulaRegex = new RegExp(/(?:=|^)([A-Z][A-Z0-9]+)?\((.*)\)/)
  var matches = formulaRegex.exec(string)
  if (matches && matches.length > 1){
    var formula = matches[1]
    var args = matches[2]
  } else {
    /* Match formula (name, aguments) in
     =2+3 => undefined, [2+3]
    */
    var formula
    var args = (string.length && string[0] == '=') ? string.slice(1) : string
  }

  /* Match arguments seperated by commas:
  1. strings: "abc123";
  2. references: G3; A$1:B$6
  2. references: G:H
  2. references: R[0]C[-1]; R2C3; R2C3:R[1]C[-3]; C1C1; R2C3 R[1]C[-3]
  3. numbers: 3.14
  4. TRUE/FALSE 
  5. nested formulas: SUM(2, 3)
  6. anything
  ... followed by comma or end of string

  https://support.office.com/en-us/article/Calculation-operators-and-precedence-in-Excel-48be406d-4975-4d31-b2b8-7af9e0e2878a
  */
  // FIXME: Why cant we start with (?:,|^)
  // Note the order in (?:,|^). ^ Must come last, to be next to the following char
  var regexStr = /((("([^"]+)?")|((\w+\!)?\$?[A-Z]\$?\d+)(\:(\w+\!)?\$?[A-Z]\$?\d+)?|((\w+\!)?\$?[A-Z]\:\$?[A-Z])|((\w+\!)?([CR](?:\[-?)?\d+\]?\:?[CR](?:\[-?)?\d+\]?)([: ][CR](?:\[-?)?\d+\]?[CR](?:\[-?)?\d+\]?)?)|(\-?[\d\.]+)|(TRUE|FALSE)|([A-Z][A-Z0-9]+\(.*\)))(\+|\&|\-|\*|\/|\^|\>|\<|\<\=|\>\=|\=|\<\>)?)+(\s+)?(?:$|,)/g
  var parsedArgs = []
  args.replace(regexStr, function(m) {
    // trimming out commas
    m = m.replace(/^[,\s]+|[,\s]+$/g, "")
    /* Match atoms, separated by operators.
       Recursively nested formulas
    */
    var regexStr = /(("([^"]+)?")|((\w+\!)?\$?[A-Z]\$?\d+)(\:(\w+\!)?\$?[A-Z]\$?\d+)?|((\w+\!)?\$?[A-Z]\:\$?[A-Z])|((\w+!)?([CR](?:\[-?)?\d+\]?\:?[CR](?:\[-?)?\d+\]?)([: ][CR](?:\[-?)?\d+\]?[CR](?:\[-?)?\d+\]?)?)|(\-?[\d\.]+)|(TRUE|FALSE)|([A-Z][A-Z0-9]+\(.*\))|(\w+))(?:\s+)?($|\-|\+|\*|\/|\&|\^|\=)/g
    var atoms = []
    m.replace(regexStr, function(all, atom) {
      // Check if nested formula
      if (formulaRegex.exec(atom)){
        atoms.push(formulas.parseString(atom))
      } else {
        atoms.push(atom)
        if (all !== atom){
          var operator = all.slice(-1)
          atoms.push(operator)
        }
      }
    })
    // [2, +, A1, *, Formula]
    parsedArgs.push(atoms)
  })
  return new Formula(formula, parsedArgs)
}

/* Return the localized name of a formula
*/
formulas.getLocalName = function(generic){
  var generic = generic.toUpperCase().trim()
  if (formulas.formulaCache){
    if ((generic in formulas.formulaCache) && (formulas.formulaCache[generic][this.language])){
      return formulas.formulaCache[generic][this.language]
    } else {
      return generic
    }
  } else {
    console.log("No cached formulas. This can't possibly happen.")
  }
}

/* Create a full, localized string from a formulaObject
       =SUMMA(A1, A2)
       ="Abc"&SUM(A2:A4)

   Cell and row numbers are required to properly translate
   relative cell references (e.g. R[-1]C[0] ==> A1)
*/
formulas.format = function(formulaObj, cell, row){
  if (formulaObj.formula){
    var localName = formulas.getLocalName(formulaObj.formula)
  } else {
    // Empty formula, e.g. ="http://"&A1
    var localName = ""
  }
  var parts = []
  for (var arg of formulaObj.args){
    var atoms = []
    for (var atom of arg){
      // Recursively render nested formulas
      if (typeof atom == "object" && ("formula" in atom)){
        atoms.push(formulas.format(atom, cell, row))
      } else {

        // Translate reserved words
        if (["TRUE", "FALSE"].indexOf(atom) > -1){
          atom = formulas.t(atom)
        }

        // Localize numerical values
        else if (isNumeric(atom)){
          var localizer = new Intl.NumberFormat(formulas.locale)
          atom = localizer.format(atom)
        }

        // Convert cell references
        else if (/(([CR](?:\[-?)?\d+\]?\:?[CR](?:\[-?)?\d+\]?)(:[CR](?:\[-?)?\d+\]?[CR](?:\[-?)?\d+\]?)?)/.exec(atom)){
          if ((typeof cell !== "undefined") && (typeof row !== "undefined")){
            // R1, R99
            atom = atom.replace(/R\d+/g, function(m) {
              return "$" + parseInt(m.slice(1))
            })
            // R[0], R[-1]
            atom = atom.replace(/R\[(\-?\d+)\]/g, function(m) {
              return row + 1 + parseInt(m.slice(2, -1), 10)
            })
            // C1
            atom = atom.replace(/C\d+/g, function(m) {
              var numval = parseInt(m.slice(1))
              return "$" + String.fromCharCode(65 + numval)
            })
            // C[-1], C[0]
            atom = atom.replace(/C\[(\-?\d+)\]/g, function(m) {
              var numval = col + parseInt(m.slice(2, -1), 10)
              return String.fromCharCode(65 + numval)
            })
            // Switch places rows/cols
            atom = atom.replace(/(\$?\d+)(\$?[A-Z])/g, function(i, r, c){return "" + c + r})
          }
        }
        atoms.push(atom)
      }
    }
    parts.push(atoms.join(""))
  }
  if (localName){
    return localName+"("+parts.join(this.sep+" ")+")"
  } else {
    return parts.join(this.sep+" ")
  }

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
  var generic = generic.toString().trim()
  if (formulas.stringChache){
    if ((generic in formulas.stringChache) && (formulas.stringChache[generic][this.language])){
      return formulas.stringChache[generic][this.language]
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
