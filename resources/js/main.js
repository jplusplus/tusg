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
    _g_tusg_tempScrollTop = $(window).scrollTop();
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
          }).fadeIn(130, loadSpreadsheets);
        }
      }
    });
  });
});

var activeCell;

function getCell(sheet, col, row){
  col = Math.max(0, col);
  col = Math.min(sheet.numCols - 1, col);
  row = Math.max(1, row);
  row = Math.min(sheet.numRows, row);
  return $(sheet).find(".c"+col+"r"+row);
}
function openCell(sheet, cell){
  var position = $(cell).position();
  var content = $(cell).data("formula");
  $(sheet.formulaTooltip)
    .css("visibility", "visible")
    .css("left", position.left)
    .css("top", position.top)
    .val(content);
  $(sheet.formulaTooltip)
    .attr('size', content.length+3)
    .css("min-width", $(cell).width()+8)
  $(cell).addClass("open");
}
function closeCell(sheet){
  $(activeCell).removeClass("open");
  $(sheet.formulaTooltip).css("visibility", "hidden");
}
function activateCell(sheet, cell){
  $(cell).addClass("active");
  $(sheet).find("th.r"+($(cell).data("row")-1)).addClass("active");
  $(sheet).find("th.c"+($(cell).data("col"))).addClass("active");
  activeCell = cell;
  sheet.lastPos = [cell.data("col"), cell.data("row")];
  $(sheet.fBar).val($(cell).data("formula"));    
}
function deactivateCell(sheet){
  if ($(activeCell).hasClass("open")){
    closeCell(sheet);
  }
  $(sheet).find("th.r"+($(activeCell).data("row")-1)).removeClass("active");
  $(sheet).find("th.c"+($(activeCell).data("col"))).removeClass("active");
  $(activeCell).removeClass("active");
  $(this.fBar).val('');
  activeCell = null;
}
/* Move to cell by index
*/
function moveTo(sheet, col, row){
  var targetCell = getCell(sheet, col, row);
  if (targetCell.is(activeCell)){
    // Don't try and move to self
  } else {
    deactivateCell(sheet);
    activateCell(sheet, targetCell);
  }
}

var loadSpreadsheets = function(sectionElem){
  _g_tusg_tempScrollTop = $(window).scrollTop();
  $(sectionElem || this).find(".replaceWithSpreadsheet").each(function(num){
    var options = {
      key: $(this).data("key"),
      text: $(this).data("text"),
      highlight: $(this).data("highlight"),
      language: _g_tusg_options.language,
      locale: _g_tusg_options.locale,
      software: _g_tusg_options.software,
      version: _g_tusg_options.version,
      os: _g_tusg_options.os,
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
          $(window).scrollTop(_g_tusg_tempScrollTop);
        }
      }
    });    
  });

};

var activateSpreadsheet = function(spreadsheet){
  spreadsheet.numCols = $(spreadsheet).data("columns");
  spreadsheet.numRows = $(spreadsheet).data("rows");
  spreadsheet.lastPos = [0, 1];
  spreadsheet.fBar = $(spreadsheet).find("input.formula")[0];
  spreadsheet.formulaTooltip = $(spreadsheet).find(".formulaTooltip")[0];
  // Event handlers to each cell
  $(spreadsheet).find(".td").each(function(cellIndex){
    var cell = this;
    $(cell).on('click touch', function(){
      moveTo(spreadsheet, $(cell).data("col"), $(cell).data("row"));
      return true
    });
    $(cell).on('dblclick', function(){
      openCell(spreadsheet, cell);
      return false
    });
  });
  // Clear active cells when leaving a spreadsheet
  $(spreadsheet).on("blur", function(){
    deactivateCell(spreadsheet);
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
        // Close open cell, or leave sheet
        if ($(activeCell).hasClass("open")){
          closeCell(this);
        } else {
          $(this).blur();
        }
        return false;
      case 113:  //F2
      case 13:  //Enter
        if (!$(activeCell).hasClass("open")){
          openCell(this, activeCell);
        }
    }
  });
}; // activate spreadsheets

/* Add spreadsheets to page*/
$(document).ready(function() {
  _g_tusg_tempScrollTop = $(window).scrollTop();
  loadSpreadsheets($(document));
});
