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
/* Spreadsheets*/
$(function() {
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
  $(".spreadsheet").each(function(spreadsheetIndex){
    var spreadsheet = this;
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
  });

});
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

  var os = $("#os").add("#os-top");
  var software = $("#software").add("#software-top");
  var version = $("#version").add("#version-top");
  // Force change and disable OS and version as needed
  // to reflect the ”real” status
  $(software).on("change", function(){
    var val = $(this).val();
    // force and disable OS
    if (val === "Excel for Mac" || val === "NeoOffice"){
      $(os).val("MacOS").attr("disabled", true);
    } else if (val === "Excel for Windows"){
      $(os).val("Windows").attr("disabled", true);
    } else {
      $(os).attr("disabled", false);
    }
    // set available version
    var selectedVersion = $("#version").val();
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
      }
    });
  });
});