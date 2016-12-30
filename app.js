var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var compression = require('compression')


/* Shortcut for creating path strings */
var p = function(){
  var path_ = __dirname
  for (x in arguments){
    path_ = path.join(path_, arguments[x])
  }
  return path_
}

var index = require(p('routes', 'index'))

var app = express()

// view engine setup
app.set('views', p('views'))
app.set('view engine', 'pug')

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(compression())
app.use(express.static(p('public')))

app.use('/', index)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Sidan hittades inte')
  err.status = 404
  next(err)
})

// error handlers

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
