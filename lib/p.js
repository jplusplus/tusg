/* Shortcut for creating path strings */
var path = require('path')

var p = function(){
  var path_ = __dirname
  for (x in arguments){
    path_ = path.join(path_, arguments[x])
  }
  return path_
}

module.exports = p
