var Intl = require('intl')
var cldr = require('cldr')

/*
  String formatting
  var str = "The {0} on the bus go {1} and {1}"
  // Use an array
  str.format(["wheels", "round"])
  // ...or multiple arguments
  str.format("wheels", "round")
*/
String.prototype.format = function() {
    var self = this
    if (arguments.length == 1 && typeof arguments[0].isArray){
      arguments = arguments[0]
    }
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi')
        self = self.replace(regexp, arguments[i])
    }
    return self
}

module.exports = function(lang){

  var textFunctions = {}
  textFunctions._lang = lang

  /* Return the current template language
  */
  textFunctions.lang = function(){
    return textFunctions._lang
  }

  // kommun => Kommun
  textFunctions.capitalize = function(val) {
      return val.charAt(0).toUpperCase() + val.slice(1)
  }

  // Kommun => kommun
  textFunctions.lower = function(val) {
    return val.toLowerCase()
  }

  /* Return a textual representation of an array,
     using ICU default lists, for languages with
     multiple list formats.

     E.g. ["a", "b", "c"] =>
      "a, b och c" (sv)
      "a, b, and c" (en)

     http://www.unicode.org/reports/tr35/tr35-general.html#ListPatterns
  */
  textFunctions.arrayText = function(arr, key) {
      if (key) {
          arr = arr.map(function(d) { return d[key] })
      }
      var len = arr.length
      if (len == 1){
        /* Only one member */
        return arr[0]
      }
      var pattern = cldr.extractListPatterns(textFunctions.lang()).default
      /* Special case patterns for this number of members */
      if (len in pattern){
        return pattern[len].format(arr)
      }
      /* Format the last two elements with the "end" format. */
      var last_elm = arr.pop()
      var str = pattern["end"].format(arr.pop(), last_elm)
      /* Then add on subsequent elements working towards the front */
      while (arr.length > 1){
        str = pattern["middle"].format(arr.pop(), str)
      }
      /* Then use "start" to add the front element */
      str = pattern["start"].format(arr[0], str)
      return str
  }

  /* Numeric ordinals, e.g. '1st', '1:a', etc
     Assume neuter where genus matters
  */
  textFunctions.ordinal = function(val){
    if (cldr.extractRbnfFunctionByType(textFunctions.lang()).renderDigitsOrdinal === 'function'){
      return cldr.extractRbnfFunctionByType(textFunctions.lang()).renderDigitsOrdinal(val)
    } else {
      // Some languages, such as Swedish, have different rbnf rulesets
      // depending on genus. Use Neuter. See e.g.:
      // https://github.com/unicode-cldr/cldr-rbnf/blob/master/rbnf/sv.json#L11
      return cldr.extractRbnfFunctionByType(textFunctions.lang()).renderDigitsOrdinalNeuter(val)
    }
  }

  /* Text representations of ordinals, e.g.
    'first', 'första', 'erste', etc
    Assume neuter when genus matters
  */
  textFunctions.ordinalText = function(val) {
    if (cldr.extractRbnfFunctionByType(textFunctions.lang()).renderSpelloutOrdinal === 'function'){
      return cldr.extractRbnfFunctionByType(textFunctions.lang()).renderSpelloutOrdinal(val)
    } else {
      // Some languages, such as Swedish, have different rbnf rulesets
      // depending on genus. Use Neuter. See e.g.:
      // https://github.com/unicode-cldr/cldr-rbnf/blob/master/rbnf/sv.json#L162
      return cldr.extractRbnfFunctionByType(textFunctions.lang()).renderSpelloutOrdinalNeuter(val)
    }
  }

  /* Spell out ordinal only for low numbers,
     for languages where that is desirable.
  */
  textFunctions.ordinalPretty = function(val) {
    if (textFunctions.inLanguages(["sv", "en"])){
      if (val < 13){
        return textFunctions.ordinalText(val)
      }
    }
    return textFunctions.ordinal(val)
  }

  function isInt(value) {
    var x = parseFloat(value)
    return !isNaN(value) && (x | 0) === x
  }

  /* Basic number formating. Use fractionDigits for maximum
     number of decimals
  */
  textFunctions.number = function(val, fractionDigits){
    if (typeof fractionDigits === "undefined"){
      fractionDigits = 1
    }
    return Intl.NumberFormat(textFunctions.lang(),
                             {maximumFractionDigits: fractionDigits})
               .format(val)
  }

  /*  Textual representation of a number, e.g.
      'Zwei', 'en miljard', 'twentyfour', etc
      FIXME: "0.4" renders "noll" in Swedish, should be "noll komma fyra"
  */
  textFunctions.numberText = function(val, genus) {
    switch(genus) {
      case "reale":
        return cldr.extractRbnfFunctionByType(textFunctions.lang()).renderSpelloutCardinalReale(val)
      case "neuter":
        return cldr.extractRbnfFunctionByType(textFunctions.lang()).renderSpelloutCardinalNeuter(val)
      case "masculine":
        return cldr.extractRbnfFunctionByType(textFunctions.lang()).renderSpelloutCardinalMasculine(val)
      case "feminine":
        return cldr.extractRbnfFunctionByType(textFunctions.lang()).renderSpelloutCardinalFeminine(val)
      default:
        return cldr.extractRbnfFunctionByType(textFunctions.lang()).renderSpelloutNumbering(val)
    }
  }

  /* Spell out cardinals only for low numbers,
     for languages where that is desirable.
     E.g. 'one', '14'
  */
  textFunctions.numberPretty = function(val, genus) {
    val = parseFloat(val) 
    if (textFunctions.inLanguages(["sv", "en"])){
      if (val < 13){
        return textFunctions.numberText(val, genus)
      }
    }
    return textFunctions.number(val)
  }

  /*  Round number
  */
  textFunctions.roundAndFormat = function(val){
    val = Math.round(parseFloat(val))
    return this.number(val)
  }

  /*  Format percent with two significant digits
      0.513 => 51
      0.00213 => 0.21
  */
  textFunctions.percent = function(val){
    var formatter = new Intl.NumberFormat(textFunctions.lang(), { maximumSignificantDigits: 2})
    return formatter.format(val*100)
  }

  /*  Format percent with two significant digits and %-sign
      0.05 =>
        Arabic: ٥٪
        Swedish: 5 %
        English: 5%
  */
  textFunctions.percentWithSign = function(val){
    var formatter = new Intl.NumberFormat(textFunctions.lang(), { maximumSignificantDigits: 2,
                                                                style: 'percent' })
    return formatter.format(val)
  }

  /*  Textual representation of percentage (rounding):
      0.0523 => fem
  */
  textFunctions.percentText = function(val){
    val = val*100
    if (val < 1){
      val = +val.toFixed(1)
    } else {
      val = Math.round(val)
    }
    return textFunctions.numberText(val)
  }

  /*  Textual representation of percentage below threshold (rounding):
      0.0523 => fem
      0.5 => 50
  */
  textFunctions.percentPretty = function(val){
    val = val*100
    if (val < 1){
      val = +val.toFixed(1)
    } else {
      val = Math.round(val)
    }
    return textFunctions.numberPretty(val)
  }

  /*  Takes a month number (0,1,2...) and returns a month name
  */
  textFunctions.monthName = function(index) {
    if (typeof textFunctions.month == 'undefined') {
      textFunctions.months = cldr.extractMonthNames(textFunctions.lang(), 'gregorian').format.wide
    }
    return textFunctions.months[index]
  }

  /* Get plain text month name from a date string (or date object)
  */
  textFunctions.getMonth = function(datestr) {
    var date_ = new Date(datestr)
    return textFunctions.monthName(date_.getMonth())
  }

  /* Get year from a date string (or date object)
  */
  textFunctions.getYear = function(datestr) {
    var date_ = new Date(datestr)
    return date_.getFullYear()
  }

  /* Pluralize according to LDML spec
  */
  textFunctions.plural = function(val, translations) {
    var class_ = cldr.extractPluralRuleFunction(textFunctions.lang())(val)
    if (class_ in translations) {
      return translations[class_]
    } else {
      return textFunctions.error("missing class keys in plural call")
    }
  }

  /* Short syntax plural function. Language dependant, 
     e.g. pl(num_horses, "häst", "hästar")
  */
  textFunctions.pl = function() {
    var val = arguments[0]
    var obj = {}
    if (textFunctions.inLanguages(["en", "sv"])){
      // Swedish
      obj["one"] = arguments[1]
      obj["other"] = arguments[2]
    } 
    return textFunctions.plural(val, obj)
  }

  /* Check if curent language is among those in
     languageArray, e.g. ["en", "sv"]
  */
  textFunctions.inLanguages = function(languageArray){
    var l = textFunctions.lang().split("-")[0]
    if (languageArray.indexOf(l) > -1 || languageArray.indexOf(textFunctions.lang()) > -1){
      return true
    } else {
      return false
    }
  }

  /* String translation
  */
  textFunctions.t = function(key){
    var l = textFunctions.lang().split("-")[0]
    if (key in textFunctions.t.translations){
      return textFunctions.t.translations[key][l]
    } else {
      return key
    }
  }

  /* String translation over an array
  */
  textFunctions.tArray = function(list){
    list.forEach(function(item, index, array){
      array[index] = textFunctions.t(item)
    })
    return textFunctions.arrayText(list)
  }

  /*  Error handling for template errors,
      to make sure they are noticed.
  */
  textFunctions.error = function(msg){
    return "ERROR: " + msg.toUpperCase()
  }

  return textFunctions
}