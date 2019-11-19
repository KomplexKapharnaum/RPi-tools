var timer = self.setInterval("bindToolbar()", 500)
var scrollPosition = $(".container-fluid-content").scrollTop();
var scolling = false;
$("#toggleToolbar").click(function (e) {
    $(".secondaryToolbar").toggleClass("show")
})

function bindToolbar() {
    var currentPosition = $(".container-fluid-content").scrollTop()
    if (currentPosition != scrollPosition) {
        scrollPosition = currentPosition;
        $("#pageNum").addClass("visible");
        scolling = true;
    } else {
        scolling = false;
        setTimeout(
            "ifHide()", 1000)
    }
}

function ifHide() {
    if ($(".container-fluid-content").scrollTop() == scrollPosition && scolling == false) {
        $("#pageNum").removeClass("visible");
    }
}
$(function () {
    var appendStr = '<div id="zoom">' +
        '<div class="w-scale-btn w-scale-shrink " id="shrinkBtn" onclick="changeTab(0)" title="缩小"></div>' +
        '<div class="w-scale-text" id="scale_text">100%</div>' +
        '<div class="w-scale-btn w-scale-magnify " id="magnifyBtn" onclick="changeTab(1)" title="放大"></div>' +
        '</div>';
    var rotateStr = '<a class="rightButton" id="rotateLeft" title="旋转" style="float:right;padding: 10px;" href="javascript:;" onclick="rotate(0)">' +
        '<img src="' + basePath + '/rotate_left.png" width="20" height="20">' +
        '</a>' +
        '<a class="rightButton" title="旋转" id="rotateRight" style="float:right;padding: 10px;" href="javascript:;" onclick="rotate(1)"> ' +
        '<img src="' + basePath + '/rotate_right.png" width="20" height="20" >' +
        '</a>';
    $(".navbar-inner .container-fluid").append(rotateStr)
    $('body').append(appendStr);
});

function changeTab(type) {
    var size = parseFloat($("#scale").val());
    var previousPage = $(".activePage").val();

    if (type == 1 && size <= 2) {
        size = size + 0.2;
    } else if (type == 0 && size >= 0.4) {
        size = size - 0.2;
    }
    $("#scale").val(size)
    $("#scale_text").html(Math.round(size * 100) + "%")
    isZoom = true;
    renderPage();
    changePage(previousPage);
    $('.word-page .mask_div').remove();
    initData();
}

function rotate(direction) {
    var angle = parseFloat($("#angle").val());
    var previousPage = $(".activePage").val();
    if (direction == 1) {
        angle = angle + 90;
    } else if (direction == 0) {
        angle = angle - 90;
    };
    $("#angle").val(angle);
    if (angle / 90 % 2 != 0) {
        isRotate = true;
    } else {
        isRotate = false;
    }

    renderPage();
    changePage(previousPage)
}