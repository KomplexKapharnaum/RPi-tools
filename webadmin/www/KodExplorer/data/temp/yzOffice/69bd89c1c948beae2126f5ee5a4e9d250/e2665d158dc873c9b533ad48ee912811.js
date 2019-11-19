// var isIe8 = false;
// if (document.all && document.querySelector && !document.addEventListener) {
//     isIe8 = true;
// } else {
//     var script = document.createElement("script");
//     script.src = basePath + "/tree.jquery.js";
//     document.getElementsByTagName('body')[0].appendChild(script);
// }
var isIe8 = false;
var DEFAULT_VERSION = 8.0;  
var ua = navigator.userAgent.toLowerCase();  
var isIE = ua.indexOf("msie")>-1;  
var safariVersion;  
if(isIE) safariVersion = ua.match(/msie ([\d.]+)/)[1];  
if(safariVersion <= DEFAULT_VERSION ){  
  isIe8 = true;
}else{
  var script = document.createElement("script");
  script.src = basePath + "/tree.jquery.js";
  document.getElementsByTagName('body')[0].appendChild(script);
}