var spreadsheetAjax = function(req, res, next) {
  // Fetch url parameters or defaults
  var options = req.options

  var spreadsheetKey = req.body.key
  var text = req.body.text
  // Normalize Excel varietes
  if (options.software.includes("Excel")) {
    options.software = "Excel"
  }
  var spreadsheet = require("../lib/spreadsheet")({
    language: options.language,
    locale: options.locale,
    software: options.software,
  })
  var opts = {};opts[spreadsheetKey] = true
  spreadsheet.filter(text, opts, function(content){
    res.json(content)
  })

}

module.exports = spreadsheetAjax
