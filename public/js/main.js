function selectText(e){var o,t=document;if(t.body.createTextRange)o=t.body.createTextRange(),o.moveToElementText(e),o.select();else if(window.getSelection){var a=window.getSelection();o=t.createRange(),o.selectNodeContents(e),a.removeAllRanges(),a.addRange(o)}}$(function(){$(".selectonclick").on("click",function(){selectText(this)});var e=$(window),o=$("#topbar");$(e).scrollTop()>380&&$(o).fadeIn(),$(e).scroll(function(){$(e).scrollTop()>380?$(o).fadeIn():$(o).fadeOut()}),$("#software").add("#software-top").on("change",function(){var e=$(this).val();"Excel for Mac"===e||"NeoOffice"===e?$("#os").add("#os-top").val("MacOS").attr("disabled",!0):"Excel for Windows"===e?$("#os").add("#os-top").val("Windows").attr("disabled",!0):$("#os").add("#os-top").attr("disabled",!1);var o=$("#version").val(),t={"Excel for Windows":["Excel 2016","Excel 2013","Excel 2010","Excel 2007"],"Excel for Mac":["Excel 2016","Excel 2015","Excel 2011","Excel 2008"],"LibreOffice/OpenOffice":["5.0.0","4.4.0","4.3.0","4.2.0","4.1.0","3.6.0"],"Google Sheets":[],NeoOffice:["NeoOffice 2015","NeoOffice 2014","NeoOffice 2013","NeoOffice 3.4"]}[e],a=t.length;t.indexOf(o)===-1&&(o=t[0]);for(var n="",c=0;c<a;c++)n+="<option",t[c]===o&&(n+=' selected="selected"'),n+=' value="'+t[c]+'">'+t[c]+"</option>";$("#version").add("#version-top").html(n),"Google Sheets"===e?$("#version").add("#version-top").attr("disabled",!0):$("#version").add("#version-top").attr("disabled",!1)}),$("form :input").on("change",function(){var e=$(this).data("pair");$("#"+e).val($(this).val())}),$("form :input").on("change",function(){var e=$(this).closest("form").serializeArray().reduce(function(e,o){return e[o.name]=o.value,e},{});$.ajax({url:"/content",contentType:"application/json",dataType:"json",type:"POST",processData:!1,data:JSON.stringify(e),success:function(e){for(var o in e){var t=$("section#"+o+" div.body");$(t).fadeOut(75,function(){$(this).html(e[o])}).fadeIn(150)}}})})});