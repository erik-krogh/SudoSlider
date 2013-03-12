$(document).ready(function(){
    var sudoSlider = $("#slider").sudoSlider({
        customFx: random,
        continuous: true,
        slideCount: 1
    });
});
function random(obj) {
    var effects = [
        pushUp,
        pushRight,
        pushDown,
        pushLeft,
        slide,
        fadeInOut,
        crossFade,
        slideDown,
        slideUp,
        show,
        // From here down, only images are supported.
        fold,
        boxRain,
        boxRainGrow,
        boxRainReverse,
        boxRainGrowReverse,
        boxRandom,
        sliceUp,
        sliceUpLeft,
        sliceDown,
        sliceDownLeft,
        sliceUpDown,
        sliceUpDownLeft
    ];
    var func = effects[Math.floor(Math.random()*effects.length)];
    return func(obj);
}

function sliceUp(obj) {
    sliceUpDownTemplate(obj, 1, false);
}
function sliceUpLeft(obj) {
    sliceUpDownTemplate(obj, 1, true);
}
function sliceDown(obj) {
    sliceUpDownTemplate(obj, 2, false);
}
function sliceDownLeft(obj) {
    sliceUpDownTemplate(obj, 2, true);
}
function sliceUpDown(obj) {
    sliceUpDownTemplate(obj, 3, false);
}
function sliceUpDownLeft(obj) {
    sliceUpDownTemplate(obj, 3, true);
}



function sliceUpDownTemplate(obj, dir, reverse) { // Dir: 1 == down, 2 == up, 3 == up/down.
    var numberOfSlices = 10;
    var speed = obj.options.speed;
    var src = $(obj.toSlides.get(0)).find('img').attr('src');
    createSlices(obj.slider, numberOfSlices, src);
    var timeBuff = 0;
    var i = 0;
    var v = 0;
    var slices = $('.nivo-slice', obj.slider);
    if (reverse) slices = $('.nivo-slice', obj.slider)._reverse();
    slices.each(function () {
        var slice = $(this);
        if (dir == 3) {
            if (i == 0) {
                slice.css('top', '0px');
                i++;
            } else {
                slice.css('bottom', '0px');
                i = 0;
            }
        } else if (dir == 2) {
            slice.css('top', '0px');
        } else {
            slice.css('bottom', '0px');
        }
        if (v == numberOfSlices - 1) {
            setTimeout(function () {
                slice.animate({
                    height: '100%',
                    opacity: '1.0'
                }, speed, '', function () {
                    obj.callback();
                    $('.nivo-slice', obj.slider).remove();
                });
            }, (100 + timeBuff));
        } else {
            setTimeout(function () {
                slice.animate({
                    height: '100%',
                    opacity: '1.0'
                }, speed);
            }, (100 + timeBuff));
        }
        timeBuff += 50;
        v++;
    });
}

function boxRandom(obj) {
    var speed = obj.options.speed;
    var options = {
        boxRows : 10,
        boxCols: 10
    }
    var src = $(obj.toSlides.get(0)).find('img').attr('src');
    createBoxes(obj.slider, options.boxRows, options.boxCols, src);
    var totalBoxes = options.boxRows * options.boxCols;
    var i = 0;
    var timeBuff = 0;
    //var boxes = shuffle($('.nivo-box', obj));
    var boxes = shuffle($('.nivo-box', obj.slider));
    boxes.each(function () {
        var box = $(this);
        if (i == totalBoxes - 1) {
            setTimeout(function () {
                box.animate({
                    opacity: '1'
                }, speed, '', function () {
                    obj.callback();
                    $('.nivo-box', obj.slider).remove();
                });
            }, (100 + timeBuff));
        } else {
            setTimeout(function () {
                box.animate({
                    opacity: '1'
                }, speed);
            }, (100 + timeBuff));
        }
        timeBuff += 20;
        i++;
    });
}

function boxRain(obj) {
    boxRainTemplate(obj, false, false);
}
function boxRainGrow(obj) {
    boxRainTemplate(obj, true, false);
}
function boxRainReverse(obj) {
    boxRainTemplate(obj, false, true);
}
function boxRainGrowReverse(obj) {
    boxRainTemplate(obj, true, true);
}

function boxRainTemplate(obj, grow, reverse) {
    var speed = obj.options.speed;
    // Note: rows must be greater than or equal to cols.
    var options = {
        boxRows : 10,
        boxCols: 10
    }
    var src = $(obj.toSlides.get(0)).find('img').attr('src');
    createBoxes(obj.slider, options.boxRows, options.boxCols, src);
    var totalBoxes = options.boxRows * options.boxCols;
    var i = 0;
    var timeBuff = 0;
    var rowIndex = 0;
    var colIndex = 0;
    var box2Darr = new Array();
    box2Darr[rowIndex] = new Array();
    var boxes = $('.nivo-box', obj.slider);
    if (reverse) {
        boxes = $('.nivo-box', obj.slider)._reverse();
    }
    boxes.each(function () {
        box2Darr[rowIndex][colIndex] = $(this);
        colIndex++;
        if (colIndex == options.boxCols) {
            rowIndex++;
            colIndex = 0;
            box2Darr[rowIndex] = new Array();
        }
    });
    for (var cols = 0; cols < (options.boxCols * 2); cols++) {
        var prevCol = cols;
        for (var rows = 0; rows < options.boxRows; rows++) {
            if (prevCol >= 0 && prevCol < options.boxCols) {
                (function (row, col, time, i, totalBoxes) {
                    var box = $(box2Darr[col][row]);
                    var w = box.width();
                    var h = box.height();
                    if (grow) {
                        box.width(0).height(0);
                    }
                    if (i == totalBoxes - 1) {
                        setTimeout(function () {
                            box.animate({
                                opacity: 1,
                                width: w,
                                height: h
                            }, speed / 1.3, '', function () {
                                $('.nivo-box', obj.slider).remove();
                                obj.callback();
                            });
                        }, (100 + time));
                    } else {
                        setTimeout(function () {
                            box.animate({
                                opacity: 1,
                                width: w,
                                height: h
                            }, speed / 1.3);
                        }, (100 + time));
                    }
                })(rows, prevCol, timeBuff, i, totalBoxes);
                i++;
            }
            prevCol--;
        }
        timeBuff += 100;
    }
}

function fold(obj) {
    var slides = 10;
    var speed = obj.options.speed;
    var src = $(obj.toSlides.get(0)).find('img').attr('src');
    createSlices(obj.slider, slides, src);
    $('.nivo-slice', obj.slider).each(function (i) {
        var timeBuff = 100 + (50 * i);
        var slice = $(this);
        var origWidth = slice.width();
        slice.css({
            top: '0px',
            height: '100%',
            width: '0px'
        });
        if (i == slides - 1) {
            setTimeout(function () {
                slice.animate({
                    width: origWidth,
                    opacity: '1.0'
                }, speed, '', function () {
                    $('.nivo-slice', obj.slider).remove();
                    obj.callback();
                });
            }, (100 + timeBuff));
        } else {
            setTimeout(function () {
                clickable = false;
                fading = true;
                slice.animate({
                    width: origWidth,
                    opacity: '1.0'
                }, speed);
            }, (100 + timeBuff));
        }
    });
}

function show(obj) {
    var vertical = obj.options.vertical;
    var ease = obj.options.ease;
    var speed = obj.options.speed;

    obj.adjustDimensionsCall(speed);

    var push = 0;
    var clones = obj.toSlides.clone();
    clones.each(function (index) {
        var that = $(this);
        that.prependTo(obj.slider);
        var extraPush = that['outer' + (vertical ? "Height" : "Width")](true);
        that.css({'z-index' : '10000', 'position' : 'absolute', 'list-style' : 'none', "top" : vertical ? push : 0, "left" : vertical ? 0 : push});
        that.hide(0);
        that.show(speed, function () {
            if (index == 0) {
                obj.callback();
            }
            that.remove();
        })
        push += extraPush;
    });
    return clones.get(0);
}

function slideUp(obj) {
    var vertical = true;
    var ease = obj.options.ease;
    var speed = obj.options.speed;

    obj.adjustDimensionsCall(speed);

    var push = 0;
    var clones = obj.toSlides.clone();
    clones.each(function (index) {
        var that = $(this);
        that.prependTo(obj.slider);
        that.css({'z-index' : 5, 'position' : 'absolute', 'list-style' : 'none', "top" : vertical ? push : 0, "left" : vertical ? 0 : push});
        push += that['outer' + (vertical ? "Height" : "Width")](true);
    });
    obj.fromSlides.css("z-index", 10).animate({height: 0}, speed, function () {
        clones.remove();
        obj.fromSlides.css("z-index", "auto").css("height", "auto");
        obj.callback();
    })
    return clones.get(0);
}

function slideDown(obj) {
    var vertical = true;
    var ease = obj.options.ease;
    var speed = obj.options.speed;

    obj.adjustDimensionsCall(speed);

    var push = 0;
    var clones = obj.toSlides.clone();
    clones.each(function (index) {
        var that = $(this);
        that.prependTo(obj.slider);
        that.css({'z-index' : '10000', 'position' : 'absolute', 'list-style' : 'none', "top" : vertical ? push : 0, "left" : vertical ? 0 : push});
        that.slideUp(0);
        that.slideDown(speed, function () {
            if (index == 0) {
                obj.callback();
            }
            that.remove();
        })
        push += that['outer' + (vertical ? "Height" : "Width")](true);
    });
    return clones.get(0);
}

function pushUp(obj) {
    push(obj, 1);
}
function pushRight(obj) {
    push(obj, 2);
}
function pushDown(obj) {
    push(obj, 3);
}
function pushLeft(obj) {
    push(obj, 4);
}

// 1: up, 2: right, 3: down, 4, left:
function push(obj, direction) {
    var vertical = direction == 2 || direction == 4;
    var negative = (direction == 2 || direction == 3) ? -1 : 1;
    var ease = obj.options.ease;
    var height = obj.toSlides.height();
    var width = obj.toSlides.width();
    var speed = obj.options.speed;

    obj.adjustDimensionsCall(speed);

    var push = 0;
    var clones = obj.toSlides.clone();
    clones.each(function (index) {
        var that = $(this);
        that.prependTo(obj.slider);
        that.css({'z-index' : '10000', 'position' : 'absolute', 'list-style' : 'none', "top" : vertical ? push : negative * height, "left" : vertical ? negative * width : push});
        that.animate(vertical ? {left: 0} : {top: 0}, speed, function () {
            if (index == 0) {
                obj.callback();
            }
            that.remove();
        })
        push += that['outer' + (vertical ? "Height" : "Width")](true);
    });
    return clones.get(0);
}

function slide(obj) {
    var ul = obj.slider.children("ul");
    var ease = obj.options.ease;
    var speed = obj.options.speed;

    obj.adjustDimensionsCall(speed);


    var left = parseInt(ul.css("marginLeft"), 10) - obj.offset.left;
    var top = parseInt(ul.css("marginTop"), 10) - obj.offset.top;

    ul.animate(
        { marginTop: top, marginLeft: left},
        {
            queue:false,
            duration:speed,
            easing: ease,
            complete: function () {
                obj.callback();
            }
        }
    );
}

function fadeInOut(obj) {
    var fadeSpeed = obj.options.fadespeed;
    var ease = obj.options.ease;
    var push = 0;

    obj.adjustDimensionsCall(fadeSpeed);

    var fadeinspeed = parseInt(fadeSpeed*(3/5), 10);
    var fadeoutspeed = fadeSpeed - fadeinspeed;

    obj.fromSlides.animate(
        { opacity: 0.0001 },
        {
            queue: false,
            duration:fadeoutspeed,
            easing:ease,
            complete:function () {
                finishFadeFx(obj, fadeSpeed);
            }
        }
    );
}


function crossFade(obj) {
    var fadeSpeed = obj.options.fadespeed;
    obj.adjustDimensionsCall(fadeSpeed);
    return finishFadeFx(obj, fadeSpeed);
}

function finishFadeFx(obj, speed) {
    var vertical = obj.options.vertical;
    var ease = obj.options.ease;
    var push = 0;
    var clones = obj.toSlides.clone();
    clones.animate({opacity: 1}, 0).each(function (index) {
        var that = $(this);
        that.prependTo(obj.slider);
        that.css({'z-index' : '10000', 'position' : 'absolute', 'list-style' : 'none', "top" : vertical ? push : 0, "left" : vertical ? 0 : push}).
        hide().fadeIn(speed, ease, function() {
            that.remove();
            if (index == 0) {
                obj.callback();
                obj.fromSlides.animate({opacity: 1}, 0);
            }
        });
        push += that['outer' + (vertical ? "Height" : "Width")](true);
    });
    return clones.get(0);
}

function createSlices(obj, slices, imageUrl) {
    for (var i = 0; i < slices; i++) {
        var sliceWidth = Math.round(obj.width() / slices);
        if (i == slices - 1) {
            obj.append($('<div class="nivo-slice"></div>').css({
                left: (sliceWidth * i) + 'px',
                width: (obj.width() - (sliceWidth * i)) + 'px',
                height: '0px',
                opacity: '0',
                background: 'url("' + imageUrl + '") no-repeat -' + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + 'px 0%'
            }));
        } else {
            obj.append($('<div class="nivo-slice"></div>').css({
                left: (sliceWidth * i) + 'px',
                width: sliceWidth + 'px',
                height: '0px',
                opacity: '0',
                background: 'url("' + imageUrl + '") no-repeat -' + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + 'px 0%'
            }));
        }
    }
}

function createBoxes(obj, numberOfCols, numberOfCols, imageUrl) {
    var boxWidth = Math.round(obj.width() / numberOfCols);
    var boxHeight = Math.round(obj.height() / numberOfCols);
    for (var rows = 0; rows < numberOfCols; rows++) {
        for (var cols = 0; cols < numberOfCols; cols++) {
            if (cols == numberOfCols - 1) {
                obj.append($('<div class="nivo-box"></div>').css({
                    opacity: 0,
                    left: (boxWidth * cols) + 'px',
                    top: (boxHeight * rows) + 'px',
                    width: (obj.width() - (boxWidth * cols)) + 'px',
                    height: boxHeight + 'px',
                    background: 'url("' + imageUrl + '") no-repeat -' + ((boxWidth + (cols * boxWidth)) - boxWidth) + 'px -' + ((boxHeight + (rows * boxHeight)) - boxHeight) + 'px'
                }));
            } else {
                obj.append($('<div class="nivo-box"></div>').css({
                    opacity: 0,
                    left: (boxWidth * cols) + 'px',
                    top: (boxHeight * rows) + 'px',
                    width: boxWidth + 'px',
                    height: boxHeight + 'px',
                    background: 'url("' + imageUrl + '") no-repeat -' + ((boxWidth + (cols * boxWidth)) - boxWidth) + 'px -' + ((boxHeight + (rows * boxHeight)) - boxHeight) + 'px'
                }));
            }
        }
    }
}

$.fn._reverse = [].reverse;

function shuffle(arr) {
    for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    return arr;
}