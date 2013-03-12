$(document).ready(function(){
    var sudoSlider = $("#slider").sudoSlider({
        customFx: show ,
        continuous: true
    });
});
function random(obj) {
    var array = [
        pushUp,
        pushRight,
        pushDown,
        pushLeft,
        slide,
        fadeInOut,
        crossFade,
        slideDown,
        slideUp,
        show
    ];
    var func = array[Math.floor(Math.random()*array.length)];
    return func(obj);
}

function show(obj) {
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
        that.hide(0);
        that.show(speed, function () {
            if (index == 0) {
                obj.callback();
            }
            that.remove();
        })
        push += that['outer' + (vertical ? "Height" : "Width")](true);
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