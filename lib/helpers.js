module.exports = function(os){

  var helpers = {}

  helpers.key = function(){
    var parts = []
    for (part in arguments){
      var name = arguments[part]
      if (name.toLowerCase() === "shift"){
        name = "<span title='Shift'>⇧</span>"
      }
      if (os === "MacOS"){
        if (name === "Ctrl"){
          name = "<span title='Command key'>⌘</span>"
        }
      }
      parts.push(name)
    }
    return "<kbd>"+parts.join("-")+"</kbd>"
  }

  helpers.image = function(text, options){
    var filename = Object.keys(options)[0]
    var class_ = Object.keys(options)[1] === "small" ? " class='col-md-5 pull-right small'" : ""
    var html = '<figure' + class_ + '>'
    html += '<img src="/img/'+filename+'">'
    if (text){
      html += '<figcaption>'+text+'</figcaption>'
    }
    html += '</figure>'
    return html
  }

  return helpers

}