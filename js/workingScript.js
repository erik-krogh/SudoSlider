$(document).ready(function(){
    var sudoSlider = $("#slider").sudoSlider({
        customFx: random,
        continuous: true,
        slideCount: 1
    });
});

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
        boxes,
        boxesGrow,
        boxesReverse,
        boxesGrowReverse,
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
    var slices = createSlices(target, obj.slider, numberOfSlices);
    var timeBuff = 0;
    var i = 0;
    var v = 0;
    if (reverse) slices = slices._reverse();
    if (randomize) slices = shuffle(slices);
    var count = 0;
    slices.each(function () {
        var slice = $(this);
        var bottom = true;
        if (dir == 3) {
            if (i == 0) {
                bottom = false;
                i++;
            } else {
                i = 0;
            }
        } else if (dir == 2) {
            bottom = false;
        }
        slice.css(bottom ? 'bottom' : 'top', '0px');
        count++;
        setTimeout(function () {
            slice.animate({
                height: '100%',
                opacity: 1
            }, speed, '', function () {
                count--;
                if (count == 0) {
                    obj.callback();
                    slices.remove();
                }
            });
        }, (100 + timeBuff));
        timeBuff += 50;
        v++;
    });
}
function boxes(obj) {
    boxTemplate(obj, false, false);
}
function boxesGrow(obj) {
    boxTemplate(obj, false, true);
}
function boxesReverse(obj) {
    boxTemplate(obj, false, false, true);
}
function boxesGrowReverse(obj) {
    boxTemplate(obj, false, true, true);
}

function boxRandom(obj) {
    boxTemplate(obj, true, false);
}

function boxRandomGrow(obj) {
    boxTemplate(obj, true, true);
}

function boxTemplate(obj, random, grow, reverse) {
    var speed = obj.options.speed;
    var boxRows = obj.options.boxrows;
    var boxCols = obj.options.boxcols;
    var target = $(obj.toSlides.get(0));
    var boxes = createBoxes(target, obj.slider, boxCols, boxRows);
    if (random) {
        boxes = shuffle(boxes);
    }
    if (reverse) {
        boxes = boxes._reverse();
    }
    var i = 0;
    var timeBuff = 0;
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
                opacity: 1,
                width: w,
                height: h
            }, speed, '', function () {
                count--;
                if (count == 0) {
                    obj.callback();
                    boxes.remove();
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
    var boxRows = obj.options.boxrows;
    var boxCols = obj.options.boxcols;
    var target = $(obj.toSlides.get(0));
    var boxes = createBoxes(target, obj.slider, boxCols, boxRows);
    var totalBoxes = boxes.length;
    var i = 0;
    var timeBuff = 0;
    var rowIndex = 0;
    var colIndex = 0;
    var box2Darr = new Array();
    box2Darr[rowIndex] = new Array();
    if (reverse) {
        boxes = boxes._reverse();
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
    var count = 0;
    for (var cols = 0; cols < (boxCols * 2) + 1; cols++) {
        var prevCol = cols;
        for (var rows = 0; rows < boxRows; rows++) {
            if (prevCol >= 0 && prevCol < boxCols) {
                (function (row, col, time, i, totalBoxes) {
                    var rawBox = box2Darr[row][col];
                    if (!rawBox) {
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
                                boxes.remove();
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
    var slicesElement = createSlices(target, obj.slider, slides);
    var count = 0;
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
        count++;
        setTimeout(function () {
            slice.animate({
                width: origWidth,
                opacity: '1.0'
            }, speed, '', function () {
                count--;
                if (count == 0) {
                    slicesElement.remove();
                    obj.callback();
                }
            });
        }, (100 + timeBuff));
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

function createSlices(target, obj, slices) {
    var result = $();
    var imageUrl = findImgUrl(target);
    for (var i = 0; i < slices; i++) {
        var sliceWidth = Math.round(target.width() / slices);
        var width;
        if (i == slices - 1) {
            width = obj.width() - (sliceWidth * i)
        } else {
            width = sliceWidth;
        }
        var slice = $('<div class="nivo-slice"></div>').css({
            position: "absolute",
            zIndex: 10000,
            left: (sliceWidth * i) + 'px',
            width: width + 'px',
            height: '0px',
            opacity: 0,
            background: 'url("' + imageUrl + '") no-repeat -' + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + 'px 0%'
        })
        obj.append(slice);
        result = result.add(slice);
    }
    return result;
}

function createBoxes(target, obj, numberOfCols, numberOfRows) {
    var result = $();
    var boxWidth = Math.round(target.width() / numberOfCols);
    var boxHeight = Math.round(target.height() / numberOfRows);
    var imageUrl = findImgUrl(target);
    for (var rows = 0; rows < numberOfRows; rows++) {
        for (var cols = 0; cols < numberOfCols; cols++) {
            var width;
            if (cols == numberOfCols - 1) {
                width = (obj.width() - (boxWidth * cols));
            } else {
                width = boxWidth;
            }
            var box = $('<div></div>').css({
                position: "absolute",
                zIndex: 10000,
                opacity: 0,
                left: (boxWidth * cols) + 'px',
                top: (boxHeight * rows) + 'px',
                width: width + 'px',
                height: boxHeight + 'px',
                background: 'url("' + imageUrl + '") no-repeat -' + ((boxWidth + (cols * boxWidth)) - boxWidth) + 'px -' + ((boxHeight + (rows * boxHeight)) - boxHeight) + 'px'
            });
            obj.append(box);
            result = result.add(box);
        }
    }
    return result;
}

function findImgUrl(slide) {
    return slide.find('img').attr('src');
}

$.fn._reverse = [].reverse;

function shuffle(arr) {
    for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x){}
    return arr;
}