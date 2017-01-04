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
          $(sectionElem).fadeOut(100, function(){
            $(sectionElem).html(res[section]);
          }).fadeIn(200);
        }
      }
    });
  });
});