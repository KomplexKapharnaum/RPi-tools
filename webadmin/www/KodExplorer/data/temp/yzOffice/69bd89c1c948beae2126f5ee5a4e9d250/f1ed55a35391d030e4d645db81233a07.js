var sUserAgent = navigator.userAgent.toLowerCase();
var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
var bIsMidp = sUserAgent.match(/midp/i) == "midp";
var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
var bIsAndroid = sUserAgent.match(/android/i) == "android";
var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
var isPhone = false;
var isZoom = false;
var curSize;
var curSizeArray = [];

if ((bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM)) {
	$(".lnk-file-title").hide();
	isPhone = true;
}
$("#toggleSidebar").is(':visible') ? $(".changePage").addClass("isSidebar") : ""
var a = $.parseJSON(widthlist);
datas = a.data;
var initialPage = 1;
var fileType = a.fileType;
var n = 2;//每次加载个数
var isRotate = false;
var isSignatureModel = false;
var loadPageNum = datas.length <= initialPage ? datas.length : initialPage;
var imgType = fileType == "word" ? "svg" : fileType == "pdf" ? "png" : fileType;
$("body").append('<input id="angle" type="hidden" value="0">');
if(isPhone && typeof("signatureUrl") != undefined)$(".docArea").append('<div class="endPage"></div>')
var t;
var currentPageIndex = 0;
for (var i = 0; i < loadPageNum; i++) {
	var activeWordPage = $(".word-page:eq('" + i + "')");
	if (!activeWordPage.attr("data-loaded")) {
		var angle = parseFloat($("#angle").val());
		if (fileType == "pdf") {
			activeWordPage.find(".word-content")
				.append('<img src="' + basePath + '/' + (i + 1) + '.png" class="loadedImg" width="100%" height="100%" style="transform:rotate(' + angle + 'deg)"/>')
				.parent(".word-page").attr("data-loaded", true);
			renderPage();
		} else if (fileType == "word") {
			activeWordPage.find(".word-content")
				.append('<embed src="' + basePath + '/' + (i + 1) + '.svg" width="100%" height="100%" style="transform:rotate(' + angle + 'deg)" type="image/svg+xml"/></embed>')
				.parent(".word-page").attr("data-loaded", true);
		}
	}
}
//navbar去掉时,去除底部页码的空格
$("#pageNum").html("").html('<span></span><span></span>')
$(".totalPage").html("/" + datas.length);
$("#pageNum span:eq(1)").html("/" + datas.length);
$(".container-fluid-content").scroll(function (e) {
	bindActiveIndex();
})
bindActiveIndex();
t = self.setInterval("intervalPage()", 5000)
$(".activePage").bind('keydown', function (event) {
	if (event.keyCode == "13") {
		changePage($(this).val())
	}
});
function renderSignaturePage(){
	var screenWidth = document.documentElement.clientWidth || window.innerWidth;
	var screenHeight = document.documentElement.clientHeight || window.innerHeight;
	var bottom_foot = $("#footer").is(':visible') ? $("#footer").height() : 
		$("#signatureTool_phone").is(':visible') ? $("#signatureTool_phone").height() : 0;
	$(".container-fluid-content").css({
		"width": screenWidth + "px",
		"height": (screenHeight - 40 - bottom_foot) + "px"
	});
}
function renderPage(pageIndex) {
	var screenWidth = document.documentElement.clientWidth || window.innerWidth;
	var screenHeight = document.documentElement.clientHeight || window.innerHeight;
	var bottom_foot = $("#footer").is(':visible') ? $("#footer").height() : 
		$("#signatureTool_phone").is(':visible') ? $("#signatureTool_phone").height() : 0;
	var position_left = $("body").hasClass('openSidebar') ? screenWidth >= 600 ? 200 : 0 : 0;
	var curPage = pageIndex ? $(".word-page:eq("+pageIndex+")") : $(".word-page");
	var header_top = $(".navbar").is(':visible') ? 41 : 0
	$(".container-fluid-content").css({
		"left":position_left,
		"width": (screenWidth - position_left) + "px",
		"height": (screenHeight - header_top - bottom_foot) + "px",
		"top":header_top + "px"
	});
	var docWidth = screenWidth - 20 - position_left
	var scale = parseFloat($("#scale").val());
	var angle = parseFloat($("#angle").val());
	$("#pageNum").css("left", screenWidth / 2 - 50)
	curPage.each(function (index, e) {
		if(pageIndex){
			index = pageIndex
		}
		var ratio = datas[index].height / datas[index].width;
		var factor = ratio > 1 ? -1 : 1;
		if (!isRotate) {
			if (datas[index].width >= docWidth) {
				$(this).css({
					"width": docWidth * scale + "px",
					"height": docWidth * ratio * scale + "px",
					"line-height": docWidth * ratio * scale + "px"
				}).find("img.loadedImg,embed").css({
					"width": docWidth * scale + "px",
					"height": docWidth * ratio * scale + "px",
					"top": "0px",
					"left": "0px",
					"transform": "rotate(" + angle + "deg)",
					"-ms-transform": "rotate(" + angle + "deg)",
					"-moz-transform": "rotate(" + angle + "deg)",
					"-webkit-transform": "rotate(" + angle + "deg)",
					"-o-transform": "rotate(" + angle + "deg)"
				});
			} else if (docWidth > datas[index].width) {
				$(this).css({
					"width": datas[index].width * scale + "px",
					"height": datas[index].height * scale + "px",
					"line-height": datas[index].height * scale + "px"
				}).find("img.loadedImg,embed").css({
					"width": datas[index].width * scale + "px",
					"height": datas[index].height * scale + "px",
					"top": "0px",
					"left": "0px",
					"transform": "rotate(" + angle + "deg)",
					"-ms-transform": "rotate(" + angle + "deg)",
					"-moz-transform": "rotate(" + angle + "deg)",
					"-webkit-transform": "rotate(" + angle + "deg)",
					"-o-transform": "rotate(" + angle + "deg)"
				});
			}
		} else if (isRotate) {
			if (datas[index].height >= docWidth) {
				$(this).css({
					"width": docWidth * scale + "px",
					"height": (docWidth / ratio) * scale + "px",
					"line-height": (docWidth / ratio) * scale + "px"
				}).find("img.loadedImg,embed").css({
					"width": (docWidth / ratio) * scale + "px",
					"height": docWidth * scale + "px",
					"top": factor * Math.abs((docWidth * scale - (docWidth / ratio) * scale) / 2)+ "px",
					"left": -factor * Math.abs((docWidth * scale - (docWidth / ratio) * scale) / 2) + "px",
					"transform": "rotate(" + angle + "deg)",
					"-ms-transform": "rotate(" + angle + "deg)",
					"-moz-transform": "rotate(" + angle + "deg)",
					"-webkit-transform": "rotate(" + angle + "deg)",
					"-o-transform": "rotate(" + angle + "deg)"
				});
			} else if (docWidth > datas[index].height) {
				$(this).css({
					"width": datas[index].height * scale + "px",
					"height": datas[index].width * scale + "px",
					"line-height": datas[index].width * scale + "px"
				}).find("img.loadedImg,embed").css({
					"width": datas[index].width * scale + "px",
					"height": datas[index].height * scale + "px",
					"top": factor * Math.abs((datas[index].height * scale - datas[index].width * scale) / 2) + "px",
					"left": -factor * Math.abs((datas[index].height * scale - datas[index].width * scale) / 2) + "px",
					"transform": "rotate(" + angle + "deg)",
					"-ms-transform": "rotate(" + angle + "deg)",
					"-moz-transform": "rotate(" + angle + "deg)",
					"-webkit-transform": "rotate(" + angle + "deg)",
					"-o-transform": "rotate(" + angle + "deg)"
				});
			}

		}
	});
	bindActiveIndex();
}
$(window).resize(function (e) {
	if(!isSignatureModel){
		renderPage()
	}else{
		renderSignaturePage()
	}
})
$(window).load(function(e){
	renderPage()
})
function changePage(index) {
	var reg = /^[0-9]*[1-9][0-9]*$/;
	if (!reg.test(index)) {
	} else if (index > datas.length || index <= 0) {
	} else {
		var pos = $(".word-page:eq('" + (index - 1) + "')").position().top + 5;
		$(".activePage").val(index);
		$(".container-fluid-content").animate({ scrollTop: pos }, 0);
	}
}
function slidePage(direction) {
	var currentIndex = $(".activePage").val();
	if (direction == 0) {
		if (currentIndex > 1) {
			currentIndex--;
			changePage(currentIndex)
		}
	} else if (direction == 1) {
		if (currentIndex < datas.length) {
			currentIndex++;
			changePage(currentIndex)
		}
	}
}
function bindActiveIndex() {
	var screenHeight = document.documentElement.clientHeight || window.innerHeight;
	var scrollHeight = $(".container-fluid-content").scrollTop();
	var activeIndex = 0;
	$(".word-page").each(function (index, e) {
		if (index > 0) {
			if ($(this).position().top - 5 - scrollHeight < 0) {
				activeIndex = index
			}
		}
	});
	$(".activePage").val(activeIndex + 1);
	$("#pageNum span:eq(0)").html(activeIndex + 1);
	if (activeIndex != currentPageIndex) {
		loadPage(activeIndex)
		currentPageIndex = activeIndex;
	}
}
function loadPage(index) {
	for (var i = index - n; i <= index + n; i++) {
		var activeWordPage = $(".word-page:eq('" + i + "')");
		if (i > 0 && i < datas.length) {
			if (!activeWordPage.attr("data-loaded")) {
				afterLoad(i)


			}
		}
	}
}
function intervalPage() {
	var i = $(".activePage").val();
	loadPage(i - 1)
}

function afterLoad(i) {

	var type = fileType == "pdf" ? "png" : "svg"
	var url = "" + basePath + "/" + (i + 1) + "." + type + "";
	var this_page = $(".word-page:eq('" + i + "')");

	$.ajax({
		url: url,
		data: {},
		type: "head",
		async: false,
		success: function (data) {
			
			if (fileType == "pdf") {
				$(".word-page:eq('" + i + "')").html("")
					.append('<div class="word-content">'
						+ '<img class="loadedImg" src="' + basePath + '/' + (i + 1) + '.png" width="100%" height="100%"/>'
						+ '</div>').attr("data-loaded", true);
				renderPage(i);


			} else if (fileType == "word") {
				$(".word-page:eq('" + i + "')").html("")
					.append('<div class="word-content">'
						+ '<embed src="' + basePath + '/' + (i + 1) + '.svg" width="100%" height="100%"  type="image/svg+xml"/></embed>'
						+ '</div>').attr("data-loaded", true)
				renderPage(i);
			}
			$('.word-page .mask_div').remove();
			initData();
		},
		error: function (data) {
			this_page.html("").removeAttr("data-loaded");
			var img = document.createElement("img");
			img.src = basePath + "/loading.gif";
			img.width = 32;
			img.height = 32;
			this_page.append(img);
			console.clear();
		}

	});
}
//侧栏
var sidebar = (function () {
    this.btn = $("#toggleSidebar"),
      this.area = $(".sidebar"),
      sidebar.prototype.bindToggle = function () {
        renderPage()
      }
    sidebar.prototype.init = function () {
      $("#footer").is(':visible') ? this.area.css("bottom", "40px") : this.area.css("bottom", "0px")
      var _self = this;
      this.btn.click(function () {
        $("body").toggleClass("openSidebar");
        _self.bindToggle();
      })
    }

  })
  var sidebar = new sidebar();
  sidebar.init();

  $(function () {
	  if(!typeof(outlineData) != undefined){
		  if(outlineData != '0'){
			    $('.sidebar').tree({
			      data: outlineData ? outlineData : [],
			      autoEscape: false,
			      autoOpen: true
			    });
			    $('.sidebar').on(
			      'tree.click',
			      function (e) {
			        changePage(e.node.page)
			
			      })
			  }
	  }
  });