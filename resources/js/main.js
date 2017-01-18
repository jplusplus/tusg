function selectText(element) {
  var doc = document;
  var range;
  if (doc.body.createTextRange) { // ms
    range = doc.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  } else if (window.getSelection) { // moz, opera, webkit
    var selection = window.getSelection();            
    range = doc.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function updateURL(key, val){
  var url = window.location.href;
  var reExp = new RegExp("[\?|\&]"+key + "=[0-9a-zA-Z\_\+\-\|\.\,\;]*");

  if(reExp.test(url)){
      reExp = new RegExp("[\?&]" + key + "=([^&#]*)");
      var delimiter = reExp.exec(url)[0].charAt(0);
      url = url.replace(reExp, delimiter + key + "=" + val);
  } else {
    var newParam = key + "=" + val;
    if(url.indexOf('?') === -1){url += '?';}

    if(url.indexOf('#') > -1){
        var urlparts = url.split('#');
        url = urlparts[0] +  "&" + newParam +  (urlparts[1] ?  "#" +urlparts[1] : '');
    } else {
        url += "&" + newParam;
    }
  }
  window.history.pushState(null, document.title, url);
}

/* General page layout */
$(function() {
  // Select snippets on single click
  function addSelectOnClick(scope){
    $(scope).find(".selectonclick").on("click", function(){
      selectText(this);
    });
  }
  addSelectOnClick("body");

  // Show topbar on scroll
  var w = $(window);
  var t = $('#topbar');
  if ($(w).scrollTop() > 380) {
    $(t).fadeIn();
  }
  $(w).scroll(function () {
    if ($(w).scrollTop() > 380) {
      $(t).fadeIn();
    } else {
      $(t).fadeOut();
    }
  });

  // Update global variables and url params
  // on form change 
  $(".form-control").on("change", function(){
    var key = $(this).attr("name");
    var val = $(this).val();
    _g_tusg_options[key] = val;
    updateURL(key, val);
  });
  var os = $("#os").add("#os-top");
  var software = $("#software").add("#software-top");
  var version = $("#version").add("#version-top");
  var language = $("#language").add("#language-top");
  var locale = $("#locale").add("#locale-top");
  // Force change and disable OS and version as needed
  // to reflect the ”real” status
  $(software).on("change", function(){
    var val = $(this).val();
    if (val === "Excel for Mac" || val === "NeoOffice"){
      $(os).val("MacOS").attr("disabled", true);
      _g_tusg_options.os = "MacOS";
      updateURL("os", "MacOS");
    } else if (val === "Excel for Windows"){
      $(os).val("Windows").attr("disabled", true);
      _g_tusg_options.os = "Windows";
      updateURL("os", "Windows");
    } else {
      $(os).attr("disabled", false);
    }
    // set available version
    var selectedVersion = $("#version").val();
    _g_tusg_options.version = selectedVersion;
    var allowedVersion = {
      "Excel for Windows": ["Excel 2016", "Excel 2013", "Excel 2010", "Excel 2007"], 
      "Excel for Mac": ["Excel 2016", "Excel 2015", "Excel 2011", "Excel 2008"],
      "LibreOffice/OpenOffice": ["5.0.0", "4.4.0", "4.3.0", "4.2.0", "4.1.0", "3.6.0"],
      "Google Sheets": [],
      "NeoOffice": ["NeoOffice 2015", "NeoOffice 2014", "NeoOffice 2013", "NeoOffice 3.4"]
    }[val];
    // default to latest if invalid
    var len = allowedVersion.length;
    if (allowedVersion.indexOf(selectedVersion) === -1){
      selectedVersion = allowedVersion[0];
      _g_tusg_options.version = selectedVersion;
      updateURL("version", selectedVersion);
    }
    var selectHtml = '';
    for (var i = 0; i< len; i++) {
        selectHtml += '<option';
        if (allowedVersion[i]===selectedVersion) {
          selectHtml += ' selected="selected"';
        }
        selectHtml += ' value="' + allowedVersion[i] + '">' + allowedVersion[i] + '</option>';
    }
    $(version).html(selectHtml);

    // disable version
    if (val === "Google Sheets"){
      $(version).attr("disabled", true);
    } else {
      $(version).attr("disabled", false);
    }
  });

  // Pair form controls
  $("form :input").on("change", function(){
    var partner = $(this).data("pair");
    $("#"+partner).val($(this).val());
  });

  // Update page on form changes
  $("form :input").on("change", function(){
    //Get form data as object
    var data = $(this).closest('form').serializeArray().reduce(function(obj, item){
      obj[item.name] = item.value;
      return obj;
    }, {});
    $.ajax({
      url: "/content",
      contentType: 'application/json',
      dataType: 'json',
      type: 'POST',
      processData: false,
      data: JSON.stringify(data),
      success: function(res){
        for (var section in res){
          var sectionElem = $("section#"+section+" div.body");
          $(sectionElem).fadeOut(75, function(){
            $(this).html(res[$(this).data("slug")]);
            addSelectOnClick(this);
          }).fadeIn(150);
        }
        var timer = setTimeout(function(){
          loadSpreadsheets();
          clearTimeout(timer);
        }, 900);
      }
    });
  });
});

var activeCell;
function moveTo(sheet, col, row){
  col = Math.max(0, col);
  col = Math.min(sheet.numCols - 1, col);
  row = Math.max(1, row);
  row = Math.min(sheet.numRows, row);
  $(activeCell).removeClass("active");
  var cell = $(sheet).find(".c"+col+"r"+row);
  $(cell).addClass("active");
  activeCell = cell;
  sheet.lastPos = [cell.data("col"), cell.data("row")];
  $(sheet).find("input").val($(cell).data("formula"));    
}

var loadSpreadsheets = function(){
  $(".replaceWithSpreadsheet").each(function(num){
    var options = {
      key: $(this).data("key"),
      text: $(this).data("text"),
      language: _g_tusg_options.language,
      locale: _g_tusg_options.locale,
      software: _g_tusg_options.software,
    };
    var self = $(this);
    $.ajax({
      url: "/spreadsheetAjax",
      contentType: 'application/json',
      dataType: 'json',
      type: 'POST',
      processData: false,
      data: JSON.stringify(options),
      success: function(res){
        var div = self.html(res);
        if (res){
          activateSpreadsheet(div.find(".spreadsheet")[0]);
        }
      }
    });    
  });

};

var activateSpreadsheet = function(spreadsheet){

  var spreadsheet = spreadsheet;
  spreadsheet.numCols = $(spreadsheet).data("columns");
  spreadsheet.numRows = $(spreadsheet).data("rows");
  spreadsheet.lastPos = [0, 1];
  var fBar = $(spreadsheet).find("input");
  // Event handlers to each cell
  $(spreadsheet).find("td").each(function(cellIndex){
    var cell = this;
    $(cell).on('click touch', function(){
      moveTo(spreadsheet, $(cell).data("col"), $(cell).data("row"));
    });
  });
  // Clear active cells when leaving a spreadsheet
  $(spreadsheet).on("blur", function(){
    $("td.active").removeClass("active");
    $(fBar).val('');
    activeCell = null;
  });
  $(spreadsheet).on("focus", function(){
    moveTo(this, spreadsheet.lastPos[0], spreadsheet.lastPos[1]);
  });
  /* Arrow key navigation */
  $(spreadsheet).on("keydown", function(e) {
    switch(e.keyCode){
      case 33:  // PgUp
        moveTo(this, $(activeCell).data("col"), 1);
        return false;
      case 34:  // PgDn
        moveTo(this, $(activeCell).data("col"), spreadsheet.numRows);
        return false;
      case 35:  // End
        moveTo(this, spreadsheet.numCols, $(activeCell).data("row"));
        return false;
      case 36:  // Home
        moveTo(this, 0, $(activeCell).data("row"));
        return false;
      case 37:  // Left
        moveTo(this, $(activeCell).data("col") - 1, $(activeCell).data("row"));
        return false;
      case 38:  // Up
        moveTo(this, $(activeCell).data("col"), $(activeCell).data("row") - 1);
        return false;
      case 39:  // Right
        moveTo(this, $(activeCell).data("col") + 1, $(activeCell).data("row"));
        return false;
      case 40:  // Down
        moveTo(this, $(activeCell).data("col"), $(activeCell).data("row") + 1);
        return false;
      case 27:  // ESC
        $(this).blur();
        return false;
    }
  });
}; // activate spreadsheets

/* Add spreadsheets to page*/
$(document).ready(function() {

  loadSpreadsheets();

});
