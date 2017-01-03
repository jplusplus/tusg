var optParser = {}

optParser.parse = function(query, defaults){
  for (var default_ in defaults){
    if (query[default_] && (defaults[default_].allowed.indexOf(query[default_]) > -1)){
      defaults[default_].selected = query[default_]
    } else {
      defaults[default_].selected = defaults[default_].default
    }
  }
  return defaults
}

optParser.forceParam = function(param, forces){
  for (var force in forces){
    if (param == force){
      return forces[force]
    }
  }
  return false
}

module.exports = optParser