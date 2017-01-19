var optParser = {}

optParser.parse = function(query, defaults){
  selected = {}
  for (var default_ in defaults){
    if ((default_ in query) &&
        (defaults[default_].allowed.indexOf(query[default_]) > -1)){
      selected[default_] = query[default_]
    } else {
      selected[default_] = defaults[default_].default
    }
  }
  return selected
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