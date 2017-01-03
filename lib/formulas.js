var csv = require("fast-csv")

var formulas = {}

formulas.cache = {}
formulas.menuCache = {}

/* Load i18n data
*/
formulas.init = function(language, callback){
  var self = this
  self.language = language
  self.sep = ";"
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
  var html = "<code class='formula selectonclick'>="+formulas.getLocalName(formulaName)+"("+args.join(formulas.sep+" ")+")</code>"
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
