var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var compression = require('compression')
var bodyParser = require('body-parser')

/* Middleware for parsing options common to all endpoints */
var settings = require('./settings')
var optParser = require('./lib/opt-parser')
var optionsParser = function(req, res, next){
  var params = req.body || req.query
  var options = optParser.parse(params, settings.defaults)
  req.selectedOptions = optParser.parse(params, settings.defaults)
  req.options = options

  // Internally treat NeoOffice as OpenOffice (because it is)
  var software = options.software
  var version = options.version
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
  }
  // Make sure to use an available version
  // for this software
  if (settings.versions[software].indexOf(version) == -1){
    // Default to latest version
    version = settings.versions[software][0]
  }
  // Normalize Excel varietes
  if (software.includes("Excel")) {
    software = "Excel"
  }

  req.options.version = version
  req.options.software = software

  next()
}

/* Shortcut for creating path strings */
var p = function(){
  var path_ = __dirname
  for (x in arguments){
    path_ = path.join(path_, arguments[x])
  }
  return path_
}

var index = require(p('routes', 'index'))
var content = require(p('routes', 'content'))
var spreadsheetAjax = require(p('routes', 'spreadsheet-ajax'))

var app = express()

// view engine setup
app.set('views', p('views'))
app.set('view engine', 'pug')

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(compression())
app.use(express.static(p('public')))
app.use(optionsParser)

app.get('/', index)
/*app.get('/spreadsheet', function(req, res, next){
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY){
    spreadsheetTest(req, res, next)
  } else {
    var err = new Error("No Google API credentials setup")
    err.status = 501
    next(err)
  }
})*/

var jsonParser = bodyParser.json()
app.post('/spreadsheetAjax', jsonParser, optionsParser, spreadsheetAjax)
app.post('/content', jsonParser, optionsParser, content)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Sidan hittades inte')
  err.status = 404
  next(err)
})

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
