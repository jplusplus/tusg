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
$(function() {
  // Select snippets on single click
  $(".selectonclick").on("click", function(){
    selectText(this);
  });

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

  // Force change and disable OS and version as needed
  // to reflect the ”real” status
  $("#software").add("#software-top").on("change", function(){
    var val = $(this).val();
    // force and diable OS
    if (val === "Excel for Mac" || val === "NeoOffice"){
      $("#os").add("#os-top").val("MacOS").attr("disabled", true);
    } else if (val === "Excel for Windows"){
      $("#os").add("#os-top").val("Windows").attr("disabled", true);
    } else {
      $("#os").add("#os-top").attr("disabled", false);
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
    $("#version").add("#version-top").html(selectHtml);

    // disable version
    if (val === "Google Sheets"){
      $("#version").add("#version-top").attr("disabled", true);
    } else {
      $("#version").add("#version-top").attr("disabled", false);
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
    var data = $(this).closest('form').serializeArray().reduce(function(obj, item) {
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
            $(this).html(res[section]);
          }).fadeIn(150);
        }
      }
    });
  });
});