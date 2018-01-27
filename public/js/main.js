/* Custom elemets */
// class xCell extends HTMLElement {};
// window.customElements.define('x-cell', xCell);
function selectText(e){var t,a=document;if(a.body.createTextRange)t=a.body.createTextRange(),t.moveToElementText(e),t.select();else if(window.getSelection){var o=window.getSelection();t=a.createRange(),t.selectNodeContents(e),o.removeAllRanges(),o.addRange(t)}}function updateURL(e,t){var a=window.location.href,o=new RegExp("[?|&]"+e+"=[0-9a-zA-Z_+-|.,;]*");if(o.test(a)){o=new RegExp("[?&]"+e+"=([^&#]*)");var l=o.exec(a)[0].charAt(0);a=a.replace(o,l+e+"="+t)}else{var i=e+"="+t;if(a.indexOf("?")===-1&&(a+="?"),a.indexOf("#")>-1){var s=a.split("#");a=s[0]+"&"+i+(s[1]?"#"+s[1]:"")}else a+="&"+i}window.history.pushState(null,document.title,a)}function getCell(e,t,a){return t=Math.max(0,t),t=Math.min(e.numCols-1,t),a=Math.max(1,a),a=Math.min(e.numRows,a),$(e).find(".c"+t+"r"+a)}function openCell(e,t){var a=$(t).position(),o=$(t).data("formula");$(e.formulaTooltip).css("visibility","visible").css("left",a.left).css("top",a.top).val(o),$(e.formulaTooltip).attr("size",o.length+3).css("min-width",$(t).width()+8),$(t).addClass("open")}function closeCell(e){$(activeCell).removeClass("open"),$(e.formulaTooltip).css("visibility","hidden")}function activateCell(e,t){$(t).addClass("active"),$(e).find("th.r"+($(t).data("row")-1)).addClass("active"),$(e).find("th.c"+$(t).data("col")).addClass("active"),activeCell=t,e.lastPos=[t.data("col"),t.data("row")],$(e.fBar).val($(t).data("formula"))}function deactivateCell(e){$(activeCell).hasClass("open")&&closeCell(e),$(e).find("th.r"+($(activeCell).data("row")-1)).removeClass("active"),$(e).find("th.c"+$(activeCell).data("col")).removeClass("active"),$(activeCell).removeClass("active"),$(this.fBar).val(""),activeCell=null}function moveTo(e,t,a){var o=getCell(e,t,a);o.is(activeCell)||(deactivateCell(e),activateCell(e,o))}var _g_tusg_tempScrollTop;$(function(){function e(e){$(e).find(".selectonclick").on("click",function(){selectText(this)})}e("body");var t=$(window),a=$("#topbar");$(t).scrollTop()>380&&$(a).fadeIn(),$(t).scroll(function(){$(t).scrollTop()>380?$(a).fadeIn():$(a).fadeOut()}),$(".form-control").on("change",function(){var e=$(this).attr("name"),t=$(this).val();_g_tusg_options[e]=t,updateURL(e,t)});var o=$("#os").add("#os-top"),l=$("#software").add("#software-top"),i=$("#version").add("#version-top");$(l).on("change",function(){var e=$(this).val();"Excel for Mac"===e||"NeoOffice"===e?($(o).val("MacOS").attr("disabled",!0),_g_tusg_options.os="MacOS",updateURL("os","MacOS")):"Excel for Windows"===e?($(o).val("Windows").attr("disabled",!0),_g_tusg_options.os="Windows",updateURL("os","Windows")):$(o).attr("disabled",!1);var t=$("#version").val();_g_tusg_options.version=t;var a={"Excel for Windows":["Excel 2016","Excel 2013","Excel 2010","Excel 2007"],"Excel for Mac":["Excel 2016","Excel 2015","Excel 2011","Excel 2008"],"LibreOffice/OpenOffice":["5.0.0","4.4.0","4.3.0","4.2.0","4.1.0","3.6.0"],"Google Sheets":[],NeoOffice:["NeoOffice 2015","NeoOffice 2014","NeoOffice 2013","NeoOffice 3.4"]}[e],l=a.length;a.indexOf(t)===-1&&(t=a[0],_g_tusg_options.version=t,updateURL("version",t));for(var s="",n=0;n<l;n++)s+="<option",a[n]===t&&(s+=' selected="selected"'),s+=' value="'+a[n]+'">'+a[n]+"</option>";$(i).html(s),"Google Sheets"===e?$(i).attr("disabled",!0):$(i).attr("disabled",!1)}),$("form :input").on("change",function(){var e=$(this).data("pair");$("#"+e).val($(this).val())}),$("form :input").on("change",function(){var t=$(this).closest("form").serializeArray().reduce(function(e,t){return e[t.name]=t.value,e},{});_g_tusg_tempScrollTop=$(window).scrollTop(),$.ajax({url:"/content",contentType:"application/json",dataType:"json",type:"POST",processData:!1,data:JSON.stringify(t),success:function(t){for(var a in t){var o=$("section#"+a+" div.body");$(o).fadeOut(75,function(){$(this).html(t[$(this).data("slug")]),e(this)}).fadeIn(130,loadSpreadsheets)}}})})});var activeCell,loadSpreadsheets=function(e){$(e||this).find(".replaceWithSpreadsheet").each(function(e){var t={key:$(this).data("key"),text:$(this).data("text"),highlight:$(this).data("highlight"),language:_g_tusg_options.language,locale:_g_tusg_options.locale,software:_g_tusg_options.software,version:_g_tusg_options.version,os:_g_tusg_options.os},a=$(this);$.ajax({url:"/spreadsheetAjax",contentType:"application/json",dataType:"json",type:"POST",processData:!1,data:JSON.stringify(t),success:function(e){var t=a.html(e);e&&(activateSpreadsheet(t.find(".spreadsheet")[0]),_g_tusg_tempScrollTop&&$(window).scrollTop(_g_tusg_tempScrollTop))}})})},activateSpreadsheet=function(e){e.numCols=$(e).data("columns"),e.numRows=$(e).data("rows"),e.lastPos=[0,1],e.fBar=$(e).find("input.formula")[0],e.formulaTooltip=$(e).find(".formulaTooltip")[0],$(e).find(".td").each(function(t){var a=this;$(a).on("click touch",function(){return moveTo(e,$(a).data("col"),$(a).data("row")),!0}),$(a).on("dblclick",function(){return openCell(e,a),!1})}),$(e).on("blur",function(){deactivateCell(e)}),$(e).on("focus",function(){moveTo(this,e.lastPos[0],e.lastPos[1])}),$(e).on("keydown",function(t){switch(t.keyCode){case 33:return moveTo(this,$(activeCell).data("col"),1),!1;case 34:return moveTo(this,$(activeCell).data("col"),e.numRows),!1;case 35:return moveTo(this,e.numCols,$(activeCell).data("row")),!1;case 36:return moveTo(this,0,$(activeCell).data("row")),!1;case 37:return moveTo(this,$(activeCell).data("col")-1,$(activeCell).data("row")),!1;case 38:return moveTo(this,$(activeCell).data("col"),$(activeCell).data("row")-1),!1;case 39:return moveTo(this,$(activeCell).data("col")+1,$(activeCell).data("row")),!1;case 40:return moveTo(this,$(activeCell).data("col"),$(activeCell).data("row")+1),!1;case 27:return $(activeCell).hasClass("open")?closeCell(this):$(this).blur(),!1;case 113:case 13:$(activeCell).hasClass("open")||openCell(this,activeCell)}})};$(document).ready(function(){loadSpreadsheets($(document))});