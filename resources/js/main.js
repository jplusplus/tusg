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
  $(".selectonclick").on("click", function(){
    selectText(this);
  });
});