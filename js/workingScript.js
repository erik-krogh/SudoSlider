$(document).ready(function(){
    var sudoSlider = $("#slider").sudoSlider({
        customFx: random,
        continuous: true,
        slideCount: 1
    });
});
// TODO: Effect where each row is shuffled.
function randomRich(obj) {
    var effects = [
        pushUp,
        pushRight,
        pushDown,
        pushLeft,
        slide,
        fadeInOut,
        crossFade,
        show
    ];
    var func = effects[Math.floor(Math.random()*effects.length)];
    return func(obj);
}
function random(obj) {
    var effects = [
        pushUp,
        pushRight,
        pushDown,
        pushLeft,
        slide,
        fadeInOut,
        crossFade,
        show,
        // From here down, only images are supported.
        fold,
        foldReverse,
        foldRandom,
        boxRain,
        boxRainGrow,
        boxRainReverse,
        boxRainGrowReverse,
        boxRandom,
        boxRandomGrow,
        sliceUp,
        sliceUpLeft,
        sliceDown,
        sliceDownLeft,
        sliceUpDown,
        sliceUpDownLeft,
        barsUp,
        barsDown,
        boxesDown,
        boxesDownGrow,
        boxesUp,
        boxesUpGrow
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

function barsUp(obj) {
    sliceUpDownTemplate(obj, 2, false, true);
}
function barsDown(obj) {
    sliceUpDownTemplate(obj, 1, false, true);
}



function sliceUpDownTemplate(obj, dir, reverse, randomize) { // Dir: 1 == down, 2 == up, 3 == up/down.
    var numberOfSlices = 10;
    var speed = obj.options.speed;
    var target = $(obj.toSlides.get(0));
    var src = target.find('img').attr('src');
    createSlices(target, obj.slider, numberOfSlices, src);
    var timeBuff = 0;
    var i = 0;
    var v = 0;
    var slices = $('.nivo-slice', obj.slider);
    if (reverse) slices = $('.nivo-slice', obj.slider)._reverse();
    if (randomize) slices = shuffle(slices);
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
    boxRandomTemplate(obj, false);
}

function boxRandomGrow(obj) {
    boxRandomTemplate(obj, true);
}

function boxRandomTemplate(obj, grow) {
    var speed = obj.options.speed;
    var boxRows = obj.options.boxrows;
    var boxCols = obj.options.boxcols;
    var target = $(obj.toSlides.get(0));
    var src = target.find('img').attr('src');
    createBoxes(target, obj.slider, boxCols, boxRows, src);
    var i = 0;
    var timeBuff = 0;
    var boxes = shuffle($('.nivo-box', obj.slider));
    var count = 0;
    boxes.each(function () {
        var box = $(this);
        var w = box.width();
        var h = box.height();
        if (grow) {
            box.width(0).height(0);
        }
        count++;
        setTimeout(function () {
            box.animate({
                opacity: '1',
                width: w,
                height: h
            }, speed, '', function () {
                count--;
                if (count == 0) {
                    obj.callback();
                    $('.nivo-box', obj.slider).remove();
                }
            });
        }, (100 + timeBuff));
        timeBuff += 20;
        i++;
    });
}

function boxesDown(obj) {
    boxRainTemplate(obj, false, false, true);
}
function boxesDownGrow(obj) {
    boxRainTemplate(obj, true, false, true);
}
function boxesUp(obj) {
    boxRainTemplate(obj, false, true, true);
}
function boxesUpGrow(obj) {
    boxRainTemplate(obj, true, true, true);
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

function boxRainTemplate(obj, grow, reverse, randomizeRows) {
    var speed = obj.options.speed;
    // Note: rows must be greater than or equal to cols.
    // TODO: Programming fuckup..
    var boxRows = obj.options.boxrows;
    var boxCols = obj.options.boxcols;
    var target = $(obj.toSlides.get(0));
    var src = target.find('img').attr('src');
    createBoxes(target, obj.slider, boxCols, boxRows, src);
    var totalBoxes = boxRows * boxCols;
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
        box2Darr[rowIndex][colIndex] = this;
        colIndex++;
        if (colIndex == boxCols) {
            if (randomizeRows) {
                box2Darr[rowIndex] = shuffle(box2Darr[rowIndex]);
            }
            rowIndex++;
            colIndex = 0;
            box2Darr[rowIndex] = new Array();
        }
    });
    if (reverse && randomizeRows) {
        // box2Darr = box2Darr.reverse();
    }
    var count = 0;
    for (var cols = 0; cols < (boxCols * 2) + 1; cols++) {
        var prevCol = cols;
        for (var rows = 0; rows < boxRows; rows++) {
            if (prevCol >= 0 && prevCol < boxCols) {
                (function (row, col, time, i, totalBoxes) {
                    var rawBox = box2Darr[row][col];
                    if (!rawBox) {
                        console.log(col + " " + row)
                        return;
                    }
                    var box = $(rawBox);
                    var w = box.width();
                    var h = box.height();
                    if (grow) {
                        box.width(0).height(0);
                    }
                    count++;
                    setTimeout(function () {
                        box.animate({
                            opacity: 1,
                            width: w,
                            height: h
                        }, speed / 1.3, function () {
                            count--;
                            if (count == 0) {
                                $('.nivo-box', obj.slider).remove();
                                obj.callback();
                            }
                        });
                    }, (100 + time));
                })(rows, prevCol, timeBuff, i, totalBoxes);
                i++;
            }
            prevCol--;
        }
        timeBuff += 100;
    }
}

function fold(obj) {
    foldTemplate(obj, false);
}

function foldReverse(obj) {
    foldTemplate(obj, true);
}

function foldRandom(obj) {
    foldTemplate(obj, false, true);
}

function foldTemplate(obj, reverse, randomize) {
    var slides = 10;
    var speed = obj.options.speed;
    var target = $(obj.toSlides.get(0));
    var src = target.find('img').attr('src');
    createSlices(target, obj.slider, slides, src);
    var slicesElement = $('.nivo-slice', obj.slider);
    if (reverse) slicesElement = slicesElement._reverse();
    if (randomize) slicesElement = shuffle(slicesElement);
    slicesElement.each(function (i) {
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
    var height = Math.max(obj.toSlides.height(), obj.fromSlides.height());
    var width = Math.max(obj.toSlides.width(), obj.fromSlides.width());
    var speed = obj.options.speed;

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
    var fadeSpeed = obj.options.speed;
    var ease = obj.options.ease;
    var push = 0;

    var fadeinspeed = parseInt(fadeSpeed*(3/5), 10);
    var fadeoutspeed = fadeSpeed - fadeinspeed;

    var clones = obj.toSlides.clone();

    obj.fromSlides.animate(
        { opacity: 0.0001 },
        {
            queue: false,
            duration:fadeoutspeed,
            easing:ease,
            complete:function () {
                finishFadeFx(obj, fadeSpeed, clones);
            }
        }
    );
    return clones.get(0);
}


function crossFade(obj) {
    var fadeSpeed = obj.options.speed;
    var clones = obj.toSlides.clone();
    finishFadeFx(obj, fadeSpeed, clones);
    return clones.get(0);
}

function finishFadeFx(obj, speed, clones) {
    var vertical = obj.options.vertical;
    var ease = obj.options.ease;
    var push = 0;
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
}

function createSlices(target, obj, slices, imageUrl) {
    for (var i = 0; i < slices; i++) {
        var sliceWidth = Math.round(target.width() / slices);
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

function createBoxes(target, obj, numberOfCols, numberOfRows, imageUrl) {
    var boxWidth = Math.round(target.width() / numberOfCols);
    var boxHeight = Math.round(target.height() / numberOfRows);
    for (var rows = 0; rows < numberOfRows; rows++) {
        for (var cols = 0; cols < numberOfCols; cols++) {
            console.log("Test");
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