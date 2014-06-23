/*
 * Sudo Slider verion 3.3.0 - jQuery plugin
 * Written by Erik Krogh Kristensen erik@webbies.dk.
 * http://webbies.dk/SudoSlider/
 *
 * Dual licensed under the MIT and GPL licenses.
 *
 * Based on EasySlider http://cssglobe.com/easy-slider-17-numeric-navigation-jquery-slider/
 * But bear little resemblance at this point.
 *
 * Built for jQuery library
 * http://jquery.com
 *
 */
(function ($, win) {
    // Saves space in the minified version.
    var undefined; // Makes sure that undefined really is undefined within this scope.
    var FALSE = false;
    var TRUE = true;

    // Constants
    var PAGES_MARKER_STRING = "pages";
    var NEXT_STRING = "next";
    var PREV_STRING = "prev";
    var LAST_STRING = "last";
    var FIRST_STRING = "first";
    var ABSOLUTE_STRING = "absolute";
    var RELATIVE_STRING = "relative";
    var HIDDEN_STRING = "hidden";
    var EMPTY_FUNCTION = function () { };
    var ANIMATION_CLONE_MARKER_CLASS = "sudo-box";
    var CSSVendorPrefix = getCSSVendorPrefix();
    var jWin = $(win);

    var TOUCHSTART = "touchstart";
    var TOUCHMOVE = "touchmove";
    var TOUCHCANCEL = "touchcancel";
    var TOUCHEND = "touchend";
    var MOUSEDOWN = "mousedown";
    var MOUSEMOVE = "mousemove";
    var MOUSEUP = "mouseup";

    $.fn.sudoSlider = function (optionsOrg) {
        // default configuration properties
        var defaults = {
            effect: "slide", /*option[0]/*effect*/
            speed: 1500, /*  option[1]/*speed*/
            customLink: FALSE, /* option[2]/*customlink*/
            controlsShow: TRUE, /*  option[3]/*controlsShow*/
            controlsFadeSpeed: 400, /*   option[4]/*controlsfadespeed*/
            controlsFade: TRUE, /*  option[5]/*controlsfade*/
            insertAfter: TRUE, /*  option[6]/*insertafter*/
            vertical: FALSE, /* option[7]/*vertical*/
            slideCount: 1, /*     option[8]/*slidecount*/
            moveCount: 1, /*     option[9]/*movecount*/
            startSlide: 1, /*     option[10]/*startslide*/
            responsive: FALSE, /* option[11]/*responsive*/
            ease: "swing", /* option[12]/*ease*/
            auto: FALSE, /* option[13]/*auto*/
            pause: 2000, /*  option[14]/*pause*/
            resumePause: FALSE, /* option[15]/*resumepause*/
            continuous: FALSE, /* option[16]/*continuous*/
            prevNext: TRUE, /*  option[17]/*prevnext*/
            numeric: FALSE, /* option[18]/*numeric*/
            numericText: [], /*    option[19]/*numerictext*/
            slices: 15, /*   option[20]/*slices*/
            boxCols: 8, /*    option[21]/*boxCols*/
            boxRows: 4, /*    option[22]/*boxRows*/
            initCallback: EMPTY_FUNCTION, /* option[23]/*initCallback*/
            ajaxLoad: EMPTY_FUNCTION, /* option[24]/*ajaxload*/
            beforeAnimation: EMPTY_FUNCTION, /* option[25]/*beforeanimation*/
            afterAnimation: EMPTY_FUNCTION, /* option[26]/*afteranimation*/
            history: FALSE, /* option[27]/*history*/
            autoHeight: TRUE, /*  option[28]/*autoheight*/
            autoWidth: TRUE, /*  option[29]/*autowidth*/
            updateBefore: FALSE, /* option[30]/*updateBefore*/
            ajax: FALSE, /* option[31]/*ajax*/
            preloadAjax: 100, /*   option[32]/*preloadajax*/
            loadingText: "", /*    option[33]/*loadingtext*/
            prevHtml: '<a href="#" class="prevBtn"> previous </a>', /* option[34]/*prevhtml*/
            nextHtml: '<a href="#" class="nextBtn"> next </a>', /* option[35]/*nexthtml*/
            controlsAttr: 'class="controls"', /* option[36]/*controlsattr*/
            numericAttr: 'class="numericControls"', /* option[37]/*numericattr*/
            interruptible: FALSE, /* option[38]/*interruptible*/
            useCSS: TRUE, /* option[39]/*useCSS*/
            loadStart: EMPTY_FUNCTION, /* option[40]/*loadStart*/
            loadFinish: EMPTY_FUNCTION,  /* option[41]/*loadFinish*/
            touch: FALSE,  /* option[42]/*touch*/
            touchHandle: FALSE, /* option[43]/*touchHandle*/
            destroyCallback: EMPTY_FUNCTION  /* option[44]/*destroyCallback*/
        };
        // Defining the base element.
        var baseSlider = this;

        optionsOrg = $.extend(objectToLowercase(defaults), objectToLowercase(optionsOrg));
        if (CSSVendorPrefix === FALSE || !minJQueryVersion([1, 8, 0])) {
            optionsOrg.usecss = FALSE;
        }

        return this.each(function () {
            var init,
                isSlideContainerUl,
                slidesContainer,
                slides,
                imagesInSlidesLoaded,
                totalSlides,
                currentSlide,
                previousSlide,
                clickable,
                numericControls,
                numericContainer,
                destroyed,
                slideNumberBeforeDestroy = FALSE,
                controls,
                nextbutton,
                prevbutton,
                autoTimeout,
                autoOn,
                numberOfVisibleSlides,
                asyncDelayedSlideLoadTimeout,
                obj = $(this),
                finishedAdjustingTo = FALSE, // This variable tells if the slider is currently adjusted (height and width) to any specific slide. This is usefull when ajax-loading stuff.
                adjustingTo, // This one tells what slide we are adjusting to, to make sure that we do not adjust to something we shouldn't.
                adjustTargetTime = 0, // This one holds the time that the autoadjust animation should complete.
                currentlyAnimating = FALSE,
                currentAnimation,
                currentAnimationCallback,
                currentAnimationObject,
                runAfterAnimationCallbacks,
                awaitingAjaxCallbacks,
                startedAjaxLoads,
                finishedAjaxLoads,
                animateToAfterCompletion = FALSE,
                animateToAfterCompletionClicked,
                animateToAfterCompletionSpeed,
                slideContainerCreated = FALSE,
                option = [],
                options = $.extend(TRUE, {}, optionsOrg),
                currentSliderPositionTop,
                currentSliderPositionLeft,
                unBindCallbacks = [],
                autoStartedWithPause = FALSE,
                animationWasInterrupted = FALSE;

            // The call to the init function is after the definition of all the functions.
            function initSudoSlider() {
                // Storing the public options in an array.
                var optionIndex = 0;
                for (var key in options) {
                    option[optionIndex] = options[key];
                    optionIndex++;
                }

                init = TRUE;

                imagesInSlidesLoaded = [];
                runAfterAnimationCallbacks = [];
                awaitingAjaxCallbacks = [];
                startedAjaxLoads = [];
                finishedAjaxLoads = [];

                // Fix for nested list items
                slidesContainer = childrenNotAnimationClones(obj);

                // Is the ul element there?
                var ulLength = slidesContainer.length;
                var newUl = $("<div></div>");
                if (!ulLength) {
                    obj.append(slidesContainer = newUl);
                    isSlideContainerUl = FALSE;
                } else if (!(isSlideContainerUl = slidesContainer.is("ul")) && !slideContainerCreated) {
                    newUl.append(slidesContainer);
                    obj.append(slidesContainer = newUl);
                }
                slideContainerCreated = TRUE;

                var slidesJquery = childrenNotAnimationClones(slidesContainer);
                slides = [];

                totalSlides = slidesJquery.length;

                slidesJquery.each(function (index, elem) {
                    var that = $(elem);
                    slides[index] = that;
                    that.css({position: RELATIVE_STRING});
                    if (that.css("display") == "none") {
                        that.css("display", "inline");
                    }
                });

                // Adding CSS classes
                slidesContainer.addClass("slidesContainer");

                slidesJquery.addClass("slide");

                // Now we are going to fix the document, if it's 'broken'. (No <li>).
                // I assume that it's can only be broken, if ajax is enabled. If it's broken without Ajax being enabled, the script doesn't have anything to fill the holes.
                if (option[31]/*ajax*/) {
                    // Do we have enough list elements to fill out all the ajax documents.
                    var numerOfAjaxUrls = option[31]/*ajax*/.length;
                    if (numerOfAjaxUrls > totalSlides) {
                        for (var a = 1; a <= numerOfAjaxUrls - totalSlides; a++) {
                            var tag;
                            if (isSlideContainerUl) {
                                tag = "li";
                            } else {
                                tag = "div";
                            }
                            var slide = $("<" + tag + ">" + option[33]/*loadingtext*/ + "</" + tag + ">");
                            slidesContainer.append(slide);
                            slides[totalSlides + (a - 1)] = slide;
                        }
                        slidesJquery = childrenNotAnimationClones(slidesContainer);
                        totalSlides = numerOfAjaxUrls;
                    }
                }

                slidesJquery.each(function (index, elem) {
                    imagesInSlidesLoaded[index] = FALSE;
                    runOnImagesLoaded($(elem), TRUE, function () {
                        imagesInSlidesLoaded[index] = TRUE;
                    });
                });

                if (slideNumberBeforeDestroy === FALSE) {
                    currentSlide = 0;
                } else {
                    currentSlide = slideNumberBeforeDestroy;
                }
                currentSlide = currentSlide || 0;

                previousSlide = currentSlide;

                clickable = TRUE;
                numericControls = [];
                destroyed = FALSE;


                // Set obj overflow to hidden (and position to relative <strike>, if fade is enabled. </strike>)
                obj.css({overflow: HIDDEN_STRING});
                if (obj.css("position") == "static") obj.css({position: RELATIVE_STRING}); // Fixed a lot of IE6 + IE7 bugs.

                // Float items to the left, and make sure that all elements are shown.
                slidesJquery.css({"float": "left", listStyle: "none", overflow: HIDDEN_STRING});
                // The last CSS to make it work.
                slidesContainer.add(slidesJquery).css({display: "block", position: RELATIVE_STRING, margin: "0"});

                option[8]/*slidecount*/ = parseInt10(option[8]/*slidecount*/);

                // Lets just redefine slidecount
                numberOfVisibleSlides = option[8]/*slidecount*/;

                option[8]/*slidecount*/ += option[9]/*movecount*/ - 1;

                // startslide can only be a number (and not 0). Converting from 1 index to 0 index.
                option[10]/*startslide*/ = parseInt10(option[10]/*startslide*/) - 1 || 0;

                option[0]/*effect*/ = getEffectMethod(option[0]/*effect*/);



                for (var a = 0; a < totalSlides; a++) {
                    if (!option[19]/*numerictext*/[a] && option[19]/*numerictext*/[a] != "") {
                        option[19]/*numerictext*/[a] = (a + 1);
                    }
                    option[31]/*ajax*/[a] = option[31]/*ajax*/[a] || FALSE;
                }

                option[5]/*controlsfade*/ = option[5]/*controlsfade*/ && !option[16]/*continuous*/;

                if (option[11]/*responsive*/) {
                    adjustResponsiveLayout(TRUE);
                }

                // Making sure that i have enough room in the <ul> (Through testing, i found out that the max supported size (height or width) in Firefox is 17895697px, Chrome supports up to 134217726px, and i didn't find any limits in IE (6/7/8/9)).
                // 9000000px gives room for about 12500 slides of 700px each (and works in every browser i tested). Down to 9000000 from 10000000 because the later might not work perfectly in FireFox on OSX.
                slidesContainer[option[7]/*vertical*/ ? "height" : "width"](9000000)[option[7]/*vertical*/ ? "width" : "height"]("100%");

                // If responsive is turned on, autowidth doesn't work.
                option[29]/*autowidth*/ = option[29]/*autowidth*/ && !option[11]/*responsive*/;

                if (option[11]/*responsive*/) {
                    bindAndRegisterOff(jWin, "resize focus", adjustResponsiveLayout, "");
                }

                if (option[3]/*controlsShow*/) {
                    controls = $("<span " + option[36]/*controlsattr*/ + "></span>");
                    obj[option[6]/*insertafter*/ ? "after" : "before"](controls);

                    if (option[18]/*numeric*/) {
                        numericContainer = $("<ol " + option[37]/*numericattr*/ + "></ol>");
                        controls.prepend(numericContainer);
                        var usePages = option[18]/*numeric*/ == PAGES_MARKER_STRING;
                        var distanceBetweenPages = usePages ? numberOfVisibleSlides : 1;
                        for (var a = 0; a < totalSlides - ((option[16]/*continuous*/ || usePages) ? 1 : numberOfVisibleSlides) + 1; a += distanceBetweenPages) {
                            numericControls[a] = $("<li data-target=\"" + (a + 1) + "\"><a href=\"#\"><span>" + option[19]/*numerictext*/[a] + "</span></a></li>")
                                .appendTo(numericContainer)
                                .click(function () {
                                    enqueueAnimation(getTargetAttribute(this) - 1, TRUE);
                                    return FALSE;
                                });
                        }
                    }
                    if (option[17]/*prevnext*/) {
                        nextbutton = makecontrol(option[35]/*nexthtml*/, NEXT_STRING);
                        prevbutton = makecontrol(option[34]/*prevhtml*/, PREV_STRING);
                    }
                }


                // Lets make those fast/normal/fast into some numbers we can make calculations with.
                var optionsToConvert = [4/*controlsfadespeed*/, 1/*speed*/, 14/*pause*/];
                for (var i = 0; i < optionsToConvert.length; i++) {
                    option[optionsToConvert[i]] = textSpeedToNumber(option[optionsToConvert[i]]);
                }

                if (option[2]/*customlink*/) {
                    bindAndRegisterOff($(document), "click", customLinkClickHandler, option[2]/*customlink*/);
                }

                runOnImagesLoaded(getSlides(option[10]/*startslide*/, option[8]/*slidecount*/), TRUE, function () {
                    if (slideNumberBeforeDestroy !== FALSE) {
                        goToSlide(slideNumberBeforeDestroy, FALSE);
                    } else if (option[27]/*history*/) {
                        // I support the jquery.address plugin, Ben Alman's hashchange plugin and Ben Alman's jQuery.BBQ.
                        var hashPlugin;
                        if (hashPlugin = jWin.hashchange) {
                            hashPlugin(URLChange);
                        } else if (hashPlugin = $.address) {
                            hashPlugin.change(URLChange);
                        } else {
                            // This assumes that jQuery BBQ is included. If not, stuff won't work in old browsers.
                            jWin.on("hashchange", URLChange);
                        }
                        URLChange();

                    } else {
                        goToSlide(option[10]/*startslide*/, FALSE);
                    }

                    setCurrent(currentSlide);
                });
                if (option[31]/*ajax*/[option[10]/*startslide*/]) {
                    ajaxLoad(option[10]/*startslide*/);
                }
                if (option[32]/*preloadajax*/ === TRUE) {
                    for (var i = 0; i < totalSlides; i++) {
                        if (option[31]/*ajax*/[i] && option[10]/*startslide*/ != i) {
                            ajaxLoad(i);
                        }
                    }
                } else {
                    startAsyncDelayedLoad();
                }
            }

            /*
             * The functions do the magic.
             */

            function customLinkClickHandler() {
                var target;
                if (target = getTargetAttribute(this)) {
                    if (target == 'stop') {
                        option[13]/*auto*/ = FALSE;
                        stopAuto();
                    } else if (target == "start") {
                        startAuto();
                        option[13]/*auto*/ = TRUE;
                    } else if (target == 'block') {
                        clickable = FALSE;
                    } else if (target == 'unblock') {
                        clickable = TRUE;
                    } else {
                        enqueueAnimation((target == parseInt10(target)) ? target - 1 : target, TRUE);
                    }
                }
                return FALSE;
            }

            // Adjusts the slider when a change in layout has happened.
            var previousAdjustedResponsiveWidth = -1;
            function adjustResponsiveLayout(forced) {
                function doTheAdjustment() {
                    if ((cantDoAdjustments() && !forced) || totalSlides == 0) {
                        return;
                    }

                    var newWidth = getResponsiveWidth();

                    if (previousAdjustedResponsiveWidth != newWidth) {
                        previousAdjustedResponsiveWidth = newWidth;

                        for (var i = 0; i < totalSlides; i++) {
                            slides[i].width(newWidth);
                        }
                        if (autoStartedWithPause !== FALSE) {
                            startAuto(autoStartedWithPause);
                        }

                        stopAnimation();
                        ensureSliderContainerCSSDurationReset();
                        adjustPositionTo(currentSlide);
                        autoadjust(currentSlide, 0);
                    }
                }
                doTheAdjustment();
                callAsync(doTheAdjustment); // Fixing invisible scrollbar.
                setTimeout(doTheAdjustment, 20);
            }

            // Returns the width of a single <li> if the page layout is responsive.
            function getResponsiveWidth() {
                return obj.width() / numberOfVisibleSlides;
            }

            // For backwards compability, the rel attribute is used as a fallback.
            function getTargetAttribute(that) {
                that = $(that);
                return that.attr("data-target") || that.attr("rel");
            }

            // Triggered when the URL changes.
            function URLChange() {
                var target = getUrlHashTarget();
                if (init) {
                    goToSlide(target, FALSE);
                } else {
                    enqueueAnimation(target, FALSE);
                }
            }

            function startAsyncDelayedLoad() {
                if (option[32]/*preloadajax*/ !== FALSE) {
                    var preloadAjaxTime = parseInt10(option[32]/*preloadajax*/);
                    if (option[31]/*ajax*/) {
                        for (var i = 0; i < option[31]/*ajax*/.length; i++) {
                            if (option[31]/*ajax*/[i]) {
                                clearTimeout(asyncDelayedSlideLoadTimeout);
                                asyncDelayedSlideLoadTimeout = setTimeout(function () {
                                    if (option[31]/*ajax*/[i]) {
                                        ajaxLoad(parseInt10(i));
                                    } else {
                                        startAsyncDelayedLoad();
                                    }
                                }, preloadAjaxTime);

                                break;
                            }
                        }
                    }
                }
            }

            function startAuto(pause) {
                if (pause === undefined) {
                    var dataPause = slides[currentSlide].attr("data-pause");
                    if (dataPause !== undefined) {
                        pause = parseInt10(dataPause);
                    } else {
                        pause = option[14]/*pause*/;
                    }
                }
                if (animationWasInterrupted) {
                    pause = mathMax(pause, 100);
                }
                stopAuto();
                autoOn = TRUE;
                autoStartedWithPause = pause;
                autoTimeout = setTimeout(function () {
                    if (autoOn) {
                        enqueueAnimation(NEXT_STRING, FALSE);
                        autoStartedWithPause = FALSE;
                    }
                }, pause);
            }

            function stopAuto(autoPossibleStillOn) {
                if (autoTimeout) {
                    clearTimeout(autoTimeout);
                }
                if (!autoPossibleStillOn) autoOn = FALSE;
            }

            function textSpeedToNumber(speed) {
                if (parseInt10(speed) || speed == 0) {
                    return parseInt10(speed);
                }
                if (speed == "fast") {
                    return 200;
                }
                if (speed == "normal" || speed == "medium") {
                    return 400;
                }
                if (speed == "slow") {
                    return 600;
                }
                return 600;
            }

            function makecontrol(html, action) {
                return $(html).prependTo(controls).click(function () {
                    enqueueAnimation(action, TRUE);
                    return FALSE;
                });
            }

            function enqueueAnimation(direction, clicked, speed) {
                if (clickable && !init) {
                    // Stopping, because if its needed then its restarted after the end of the animation.
                    stopAuto(TRUE);

                    if (!destroyed) {
                        loadSlidesAndAnimate(direction, clicked, speed);
                    }
                } else {
                    if (option[38]/*interruptible*/ && currentlyAnimating) {
                        stopAnimation();
                        enqueueAnimation(direction, clicked, speed);
                    } else {
                        animateToAfterCompletion = direction;
                        animateToAfterCompletionClicked = clicked;
                        animateToAfterCompletionSpeed = speed;

                        // I can just as well start the ajax loads
                        if (option[31]/*ajax*/) {
                            var targetSlide = filterDir(direction);
                            for (var loadSlide = targetSlide; loadSlide < targetSlide + numberOfVisibleSlides; loadSlide++) {
                                if (option[31]/*ajax*/[loadSlide]) {
                                    ajaxLoad(getRealPos(loadSlide));
                                }
                            }
                        }
                    }
                }
            }

            // It may not sound like it, but the variable fadeOpacity is only for TRUE/FALSE.
            function fadeControl(fadeOpacity, fadetime, nextcontrol) {
                fadeOpacity = fadeOpacity ? 1 : 0;
                var fadeElement = $();

                if (option[3]/*controlsShow*/ && option[17]/*prevnext*/) {
                    fadeElement = nextcontrol ? nextbutton : prevbutton;
                }

                if (option[2]/*customlink*/) {
                    var customLink = $(option[2]/*customlink*/);
                    var filterString = "=\"" + (nextcontrol ? NEXT_STRING : PREV_STRING) + "\"]";
                    var filtered = customLink.filter("[rel" + filterString + ", [data-target" + filterString + "");
                    fadeElement = fadeElement.add(filtered);
                }

                var adjustObject = {opacity: fadeOpacity};

                function callback() {
                    if (!fadeOpacity && fadeElement.css("opacity") == 0) {
                        fadeElement.css({visibility: HIDDEN_STRING});
                    }
                }

                if (fadeOpacity) {
                    fadeElement.css({visibility: "visible"});
                }

                if (option[39]/*useCSS*/) {
                    animate(fadeElement, adjustObject, fadetime, option[12]/*ease*/, callback);
                } else {
                    fadeElement.animate(
                        adjustObject,
                        {
                            queue: FALSE,
                            duration: fadetime,
                            easing: option[12]/*ease*/,
                            callback: callback
                        }
                    );
                }
            }

            // Fade the controls, if we are at the end of the slide.
            // It's all the different kind of controls.
            function fadeControls(a, fadetime) {
                fadeControl(a, fadetime, FALSE); // abusing that the number 0 == FALSE.
                // The new way of doing it.
                fadeControl(a < totalSlides - numberOfVisibleSlides, fadetime, TRUE);
            }

            // Updating the 'current' class
            function setCurrent(i) {
                i = getRealPos(i) + 1;

                // Fixing that the last numeric control isn't marked when we are at the last possible position.
                if (option[18]/*numeric*/ == PAGES_MARKER_STRING && i == totalSlides - numberOfVisibleSlides + 1 && !option[16]/*continuous*/) {
                    i = totalSlides;
                }

                if (option[18]/*numeric*/){
                    for (var control = 0; control < numericControls.length; ++control) {
                        var element = numericControls[control];
                        setCurrentElement(element, i)
                    }
                }
                if (option[2]/*customlink*/) setCurrentElement($(option[2]/*customlink*/), i);
            }

            function setCurrentElement(element, i) {
                if (element && element.filter) {
                    element
                        .filter(".current")
                        .removeClass("current");

                    element
                        .filter(function () {
                            var elementTarget = getTargetAttribute(this);
                            if (option[18]/*numeric*/ == PAGES_MARKER_STRING) {
                                for (var a = numberOfVisibleSlides - 1; a >= 0; a--) {
                                    if (elementTarget == i - a) {
                                        return TRUE;
                                    }
                                }
                            } else {
                                return elementTarget == i;
                            }
                            return FALSE;
                        })
                        .addClass("current");
                }
            }

            function getUrlHashTarget() {
                var hashString = location.hash.substr(1)
                for (var i = 0; i < option[19]/*numerictext*/.length; i++) {
                    if (option[19]/*numerictext*/[i] == hashString) {
                        return i;
                    }
                }
                if (hashString && !init) {
                    return currentSlide;
                } else {
                    return option[10]/*startslide*/;
                }
            }

            function autoadjust(i, speed) {
                i = getRealPos(i); // I assume that the continuous clones, and the original element is the same height. So i always adjust according to the original element.

                adjustingTo = i;
                adjustTargetTime = getTimeInMillis() + speed;

                if (speed == 0) {
                    finishedAdjustingTo = i;
                } else {
                    finishedAdjustingTo = FALSE;
                }

                if (option[28]/*autoheight*/ || option[29]/*autowidth*/) {
                    autoHeightWidth(i);
                }
            }


            function autoHeightWidth(i) {
                obj.ready(function () {
                    adjustHeightWidth(i);
                    runOnImagesLoaded(slides[i], FALSE, makeCallback(adjustHeightWidth, [i]));
                });
            }

            // Axis: TRUE == height, FALSE == width.
            function getSliderDimensions(fromSlide, axis) {
                var pixels = 0;
                for (var slide = fromSlide; slide < fromSlide + numberOfVisibleSlides; slide++) {
                    var targetSlide = slides[getRealPos(slide)];
                    if (targetSlide) {
                        var targetPixels = targetSlide['outer' + (axis ? "Height" : "Width")](TRUE);
                        if (axis == option[7]/*vertical*/) {
                            pixels += targetPixels;
                        } else {
                            pixels = mathMax(targetPixels, pixels);
                        }
                    }
                }
                return pixels;
            }

            function adjustHeightWidth(i) {
                if (i != adjustingTo || cantDoAdjustments()) {
                    return;
                }

                var speed = adjustTargetTime - getTimeInMillis();
                speed = mathMax(speed, 0);
                var adjustObject = {};
                if (option[28]/*autoheight*/) {
                    adjustObject.height = getSliderDimensions(i, TRUE) || 1; // Making it completely invisible gives trouble.
                }
                if (option[29]/*autowidth*/) {
                    adjustObject.width = getSliderDimensions(i, FALSE) || 1;
                }

                if (option[39]/*useCSS*/) {
                    animate(obj, adjustObject, speed, option[12]/*ease*/)
                } else {
                    if (speed == 0) {
                        // Doing CSS if speed == 0, 1: its faster. 2: it fixes bugs.
                        obj.stop().css(adjustObject);
                    } else {
                        obj.animate(
                            adjustObject,
                            {
                                queue: FALSE,
                                duration: speed,
                                easing: option[12]/*ease*/
                            }
                        );
                    }
                }
            }

            function adjustPositionTo(slide) {
                var left = getSlidePosition(slide, FALSE);
                var top = getSlidePosition(slide, TRUE);

                adjustPositionToPosition(left, top);
            }

            function adjustPositionToPosition(left, top) {
                currentSliderPositionLeft = left;
                currentSliderPositionTop = top;

                if (option[39]/*useCSS*/) {
                    slidesContainer.css({transform: "translate(" + left + "px, " + top + "px)"});
                } else {
                    function setMargins(left, top) {
                        slidesContainer.css({
                            marginLeft: left,
                            marginTop: top
                        });
                    }
                    setMargins(0, 0);
                    setMargins(left, top);
                }
            }

            function getSlidePosition(slide, vertical) {
                var targetSlide = slides[getRealPos(slide)];
                return (targetSlide && targetSlide.length) ? -targetSlide.position()[vertical ? "top" : "left"] : 0;
            }

            function callQueuedAnimation() {
                if (animateToAfterCompletion !== FALSE) {
                    var animateTo = animateToAfterCompletion;
                    animateToAfterCompletion = FALSE;
                    callAsync(makeCallback(enqueueAnimation, [animateTo, animateToAfterCompletionClicked, animateToAfterCompletionSpeed]));
                }
            }

            function adjust(clicked) {
                ensureSliderContainerCSSDurationReset();

                autoadjust(currentSlide, 0);
                currentSlide = getRealPos(currentSlide); // Going to the real slide, away from the clone.
                if (!option[30]/*updateBefore*/) setCurrent(currentSlide);
                adjustPositionTo(currentSlide);
                clickable = TRUE;

                if (option[13]/*auto*/) {
                    // Stopping auto if clicked. And also continuing after X seconds of inactivity.
                    if (clicked) {
                        stopAuto();
                        if (option[15]/*resumepause*/) startAuto(option[15]/*resumepause*/);
                    } else if (!init) {
                        startAuto();
                    }
                }

                callQueuedAnimation();
            }

            // This function is called when i need a callback on the current element and it's continuous clones (if they are there).
            // after:  TRUE == afteranimation : FALSE == beforeanimation;
            function aniCall(i, after, synchronous) {
                i = getRealPos(i);
                // Wierd fix to let IE accept the existance of the sudoSlider object.
                var func = makeCallback(after ? afterAniCall : beforeAniCall, [slides[i], i + 1]);
                if (synchronous) {
                    func();
                } else {
                    callAsync(func);
                }
            }

            function afterAniCall(el, a) {
                option[26]/*afteranimation*/.call(el, a);
            }

            function beforeAniCall(el, a) {
                option[25]/*beforeanimation*/.call(el, a);
            }

            // Convert the direction into a usefull number.
            function filterDir(dir) {
                if (dir == NEXT_STRING) {
                    return limitDir(currentSlide + option[9]/*movecount*/, dir);
                } else if (dir == PREV_STRING) {
                    return limitDir(currentSlide - option[9]/*movecount*/, dir);
                } else if (dir == FIRST_STRING) {
                    return 0;
                } else if (dir == LAST_STRING) {
                    return totalSlides - 1;
                } else {
                    return limitDir(parseInt10(dir), dir);
                }
            }

            // If continuous is off, we sometimes do not want to move to far.
            // This method was added in 2.1.8, se the changelog as to why.
            function limitDir(i, dir) {
                if (option[16]/*continuous*/) {
                    if (dir == NEXT_STRING || dir == PREV_STRING) {
                        return i;
                    } else {
                        return getRealPos(i);
                    }
                } else {
                    var maxSlide = totalSlides - numberOfVisibleSlides;
                    if (i > maxSlide) {
                        if (currentSlide == maxSlide && dir == NEXT_STRING) {
                            return 0;
                        } else {
                            return maxSlide;
                        }
                    } else if (i < 0) {
                        if (currentSlide == 0 && dir == PREV_STRING) {
                            return maxSlide;
                        } else {
                            return 0;
                        }
                    } else {
                        return i;
                    }
                }
            }

            // Load a ajax document (or image) into a slide.
            // If testing this locally (loading everything from a harddisk instead of the internet), it may not work.
            // But then try to upload it to a server, and see it shine.
            function ajaxLoad(slide, ajaxCallBack) {
                if (ajaxCallBack) {
                    var callbackList = awaitingAjaxCallbacks[slide];
                    if (!callbackList) {
                        callbackList = awaitingAjaxCallbacks[slide] = [];
                    }
                    callbackList.push(ajaxCallBack);
                }

                if (finishedAjaxLoads[slide]) {
                    if (ajaxCallBack) {
                        runOnImagesLoaded(slides[slide], TRUE, makeCallback(callAsync, [ajaxCallBack]));
                    }
                    return;
                }

                if (startedAjaxLoads[slide]) {
                    return;
                }
                startedAjaxLoads[slide] = TRUE;

                var target = option[31]/*ajax*/[slide];
                if (!target) {
                    callAsync(ajaxCallBack);
                    return;
                }

                if (asyncDelayedSlideLoadTimeout) clearTimeout(asyncDelayedSlideLoadTimeout);// I dont want it to run to often.

                var targetslide = slides[slide];

                // Loads the url as an image, either if it is an image, or if everything else failed.
                function loadImage() {
                    var image = new Image();
                    image.src = target;
                    var thatImage = $(image);
                    runOnImagesLoaded(thatImage, TRUE, makeCallback(runWhenNotAnimating, [function () {
                        targetslide.empty().append(image);

                        ajaxAdjust(slide, TRUE);
                    }]));
                }

                var succesRan = FALSE;

                $.ajax({
                    url: target,
                    success: function (data, textStatus, jqXHR) {
                        succesRan = TRUE;
                        runWhenNotAnimating(function () {
                            var type = jqXHR.getResponseHeader('Content-Type');
                            if (type && type.substr(0, 1) != "i") {
                                targetslide.html(data);
                                ajaxAdjust(slide, FALSE);
                            } else {
                                loadImage();
                            }
                        });
                    },
                    complete: function () {
                        // Some browsers wont load images this way, so i treat an error as an image.
                        // There is no stable way of determining if it's a real error or if i tried to load an image in a old browser, so i do it this way.
                        if (!succesRan) {
                            loadImage();
                        }
                    }
                });
                // It is loaded, we dont need to do that again.
                option[31]/*ajax*/[slide] = FALSE;
                // It is the only option that i need to change for good.
                options.ajax[slide] = FALSE;
            }

            // Performs the callback immediately if no animation is running.
            // Otherwise waits for the animation to complete in a FIFO queue.
            function runWhenNotAnimating(completeFunction) {
                if (currentlyAnimating) {
                    runAfterAnimationCallbacks.push(completeFunction);
                } else {
                    callAsync(completeFunction);
                }
            }

            function ajaxAdjust(i, img) {
                var target = slides[i];

                adjustPositionTo(currentSlide);
                autoadjust(currentSlide, 0);

                runOnImagesLoaded(target, TRUE, makeCallback(runWhenNotAnimating, [
                    function () {
                        adjustPositionTo(currentSlide);
                        autoadjust(currentSlide, 0);

                        finishedAjaxLoads[i] = TRUE;

                        performCallbacks(awaitingAjaxCallbacks[i]);

                        startAsyncDelayedLoad();

                        callAsync(function () {
                            option[24]/*ajaxload*/.call(slides[i], i + 1, img);
                        });

                        if (init) {
                            init = FALSE;
                            callAsync(performInitCallback);
                        }
                    }
                ]));
            }

            function performInitCallback() {
                if (option[16]/*continuous*/) {
                    centerTargetSlideAfter(currentSlide);
                }

                autoadjust(currentSlide, 0);
                adjustPositionTo(currentSlide);
                callQueuedAnimation();
                if (option[11]/*responsive*/) {
                    adjustResponsiveLayout();
                }
                if (option[13]/*auto*/) {
                    startAuto();
                }
                option[23]/*initCallback*/.call(baseSlider);

                if (option[42]/*touch*/) {
                    setUpTouch();
                }

                // Fixing once and for all that the wrong slide is shown on init.
                runOnImagesLoaded(getSlides(currentSlide, totalSlides), FALSE, makeCallback(runWhenNotAnimating, [
                    function () {
                        autoadjust(currentSlide, 0);
                        adjustPositionTo(currentSlide);
                    }
                ]));
            }

            function setUpTouch() {
                var easingToUse;
                var runningTouchEffect = FALSE;

                var prevEffect = option[0]/*effect*/;

                option[0]/*effect*/ = function (obj) {
                    if (runningTouchEffect) {
                        runningTouchEffect = FALSE;
                        obj.options.ease = easingToUse;
                        return slide(obj);
                    } else {
                        return prevEffect(obj);
                    }
                };
                var initialOffsetLeft;
                var initialOffsetTop;

                var startTime;
                var lastTime;
                var lastDistance;

                var bufferSize = 3;
                var positionsBuffer = [];
                var timeBuffer = [];
                var bufferIndex = 0;

                function touchStart(x, y) {
                    currentlyAnimating = TRUE;
                    ensureSliderContainerCSSDurationReset();
                    initialOffsetTop = currentSliderPositionTop;
                    initialOffsetLeft = currentSliderPositionLeft;

                    var distance;
                    if (option[7]/*vertical*/) {
                        distance = mathAbs(y);
                    } else {
                        distance = mathAbs(x);
                    }

                    lastDistance = distance;
                    startTime = getTimeInMillis();
                    lastTime = startTime;
                }

                function touchMove(x, y) {
                    var distance;
                    if (option[7]/*vertical*/) {
                        distance = mathAbs(y);
                    } else {
                        distance = mathAbs(x);
                    }
                    positionsBuffer[bufferIndex]  = distance - lastDistance;
                    var newTime = getTimeInMillis();
                    timeBuffer[bufferIndex] = newTime - lastTime;
                    bufferIndex = (bufferIndex + 1) % bufferSize;

                    lastTime = newTime;
                    lastDistance = distance;

                    if (option[7]/*vertical*/) {
                        x = 0;
                    } else {
                        y = 0;
                    }
                    adjustPositionToPosition(initialOffsetLeft + x, initialOffsetTop + y);
                }

                function touchEnd(x, y) {
                    var distance;
                    if (option[7]/*vertical*/) {
                        distance = y;
                    } else {
                        distance = x;
                    }
                    var distanceAbs = mathAbs(distance);
                    var currentTime = getTimeInMillis();
                    var time = 0;
                    var bufferDistance = 0;
                    for (var i = 0; i < bufferSize; i++) {
                        var thisTime = timeBuffer[i];
                        if (thisTime + 100 < currentTime) {
                            time += thisTime;
                            bufferDistance += positionsBuffer[i];
                        }
                    }
                    var slideDimensions;
                    if (option[7]/*vertical*/) {
                        slideDimensions = obj.height();
                    } else {
                        slideDimensions = obj.width();
                    }
                    // This is in pixels pr. ms.
                    var speed = mathAbs(bufferDistance) / time;

                    var goToAnotherSlide = speed >= 0.2 || distanceAbs >= slideDimensions / 2;

                    if ((bufferDistance > 0 && distanceAbs < 0) || (bufferDistance < 0 && distanceAbs > 0) || distanceAbs <= 10) {
                        goToAnotherSlide = FALSE;
                    }


                    var direction = distance < 0 ? NEXT_STRING : PREV_STRING;

                    if (!option[16]/*continuous*/) {
                        if (currentSlide + 1 == totalSlides) {
                            if (direction == NEXT_STRING) {
                                goToAnotherSlide = FALSE;
                            }
                        } else if (currentSlide == 0) {
                            if (direction == PREV_STRING) {
                                goToAnotherSlide = FALSE;
                            }
                        }
                    }

                    var distanceLeft;
                    if (goToAnotherSlide) {
                        distanceLeft = slideDimensions - distanceAbs;
                    } else {
                        distanceLeft = distanceAbs;
                    }

                    var timeFromSpeed = (distanceLeft / speed) * 1.3;
                    var timeFromDistance = mathMax((option[1]/*speed*/) * (slideDimensions / distanceLeft), (option[1]/*speed*/) / 4);

                    var timeLeft;
                    if (timeFromSpeed < timeFromDistance) {
                        timeLeft = mathMin(timeFromSpeed, (option[1]/*speed*/));
                    } else {
                        timeLeft = mathMin(timeFromDistance, (option[1]/*speed*/));
                    }

                    var cubicBezierY = (speed*timeLeft)/(distanceLeft + speed*timeLeft);
                    var cubicBezierX = 1-cubicBezierY;//distanceLeft/(distanceLeft + speed*timeLeft);

                    if (option[39]/*useCSS*/) {
                        easingToUse = "cubic-bezier(" + cubicBezierX + "," + cubicBezierY + ",0.3,1)";
                    } else {
                        easingToUse = makeBezier([cubicBezierX || 0, cubicBezierY || 0, 0.3, 1]);
                    }

                    clickable = FALSE;
                    runningTouchEffect = TRUE;
                    if (goToAnotherSlide) {
                        performAnimation(filterDir(direction), timeLeft, TRUE, TRUE, TRUE);
                    } else {
                        performAnimation(currentSlide, timeLeft, TRUE, TRUE, TRUE);
                    }
                }

                {
                    var startedTouch = FALSE;
                    var startX = 0;
                    var startY = 0;
                    var prevX = 0;
                    var prevY = 0;

                    var dragFunction = function (event) {
                        if (!clickable) {
                            return;
                        }
                        var type = event.type;
                        var startEvent;
                        var endEvent1;
                        var endEvent2;
                        var isMouseEvent = type.substr(0, 1) == "m";
                        if (isMouseEvent) {
                            startEvent = MOUSEDOWN;
                            endEvent1 = MOUSEUP;
                            endEvent2 = "";
                        } else {
                            startEvent = TOUCHSTART;
                            endEvent1 = TOUCHEND;
                            endEvent2 = TOUCHCANCEL;
                            event = event.originalEvent;
                        }


                        if (!startedTouch) {
                            if (type != startEvent) {
                                return;
                            }

                            var eventTarget = event.target;
                            var target = $(eventTarget);
                            if (!option[43]/*touchHandle*/) {
                                target = target.parents().add(eventTarget);
                            }
                            var filter = option[43]/*touchHandle*/ || obj;

                            var isTarget = target.filter(filter).length;

                            if (!isTarget) {
                                return;
                            } else {
                                startedTouch = TRUE;
                            }
                        }

                        if (type != endEvent1 && type != endEvent2) {
                            var x;
                            var y;
                            if (isMouseEvent) {
                                x = event.pageX;
                                y = event.pageY;
                            } else {
                                var touch = event.touches[0];
                                x = touch.pageX;
                                y = touch.pageY;
                            }


                            if (type == startEvent) {
                                startX = x;
                                startY = y;
                                touchStart(x - startX, y - startY)
                            } else {
                                touchMove(x - startX, y - startY);
                            }

                            allowScroll(event, isMouseEvent, prevX, prevY, x - startX, y - startY);

                            prevX = x - startX;
                            prevY = y - startY;
                        } else {
                            touchEnd(prevX, prevY);
                            startedTouch = FALSE;
                            event.preventDefault();
                        }
                    };
                    bindMultiple(document, dragFunction, [TOUCHSTART, TOUCHMOVE, TOUCHEND, TOUCHCANCEL, MOUSEDOWN, MOUSEMOVE, MOUSEUP]);
                }

                function allowScroll(event, isMouseEvent, prevX, prevY, x, y) {
                    isMouseEvent = FALSE;
                    if (isMouseEvent || isDirectionVertical(prevX, prevY, x, y) == option[7]/*vertical*/) {
                        event.preventDefault();
                    }
                }

                function isDirectionVertical(prevX, prevY, x, y) {
                    var dX = prevX - x;
                    var dY = prevY - y;

                    return mathAbs(dY / dX) >= 1;
                }
            }

            function performCallbacks(callbacks) {
                while (callbacks && callbacks.length) {
                    // Removing and running the first, so we maintain FIFO.
                    callbacks.splice(0, 1)[0]();
                }
            }

            function isContentInSlideReady(slide) {
                if (!imagesInSlidesLoaded[slide]) {
                    return FALSE;
                }
                if (!option[31]/*ajax*/) {
                    return TRUE;
                } else {
                    if (option[31]/*ajax*/[slide]) {
                        return FALSE;
                    }
                    return !(startedAjaxLoads[slide] && !finishedAjaxLoads[slide]);
                }
            }

            function loadSlidesAndAnimate(i, clicked, speed) {
                var dir = filterDir(i);
                var prevNext = i == NEXT_STRING || i == PREV_STRING;

                var targetSlide = getRealPos(dir);
                if (targetSlide == currentSlide) {
                    return;
                }
                clickable = FALSE;
                if (option[31]/*ajax*/) {
                    var waitCounter = 0;
                    for (var loadSlide = targetSlide; loadSlide < targetSlide + numberOfVisibleSlides; loadSlide++) {
                        var realLoadSlide = getRealPos(loadSlide);
                        if (!isContentInSlideReady(realLoadSlide)) {
                            waitCounter++;
                            ajaxLoad(realLoadSlide, function () {
                                // This runs aync, so every callback is placed before the first is run. Therefore this works.
                                waitCounter--;
                                if (waitCounter == 0) {
                                    option[41]/*loadFinish*/.call(baseSlider, dir + 1);
                                    performAnimation(dir, speed, clicked, prevNext);
                                }
                            });
                        }
                    }
                    if (waitCounter == 0) {
                        performAnimation(dir, speed, clicked, prevNext);
                    } else {
                        option[40]/*loadStart*/.call(baseSlider, dir + 1);
                    }
                } else {
                    performAnimation(dir, speed, clicked, prevNext);
                }
            }

            function ensureSliderContainerCSSDurationReset() {
                if (option[39]/*useCSS*/) {
                    slidesContainer.css(CSSVendorPrefix + "transition-duration", "");
                }
            }

            var reorderedSlidesToStartFromSlide = 0;
            function reorderSlides(slide) {
                if (getRealPos(slide) == reorderedSlidesToStartFromSlide) {
                    return;
                }
                reorderedSlidesToStartFromSlide = slide;
                ensureSliderContainerCSSDurationReset();
                for (var i = 0; i < totalSlides; i++) {
                    var slideToInsert = slides[getRealPos((slide + i))];
                    slidesContainer.append(slideToInsert);
                }
                adjustPositionTo(currentSlide);
            }

            function centerTargetSlideAdjusted(targetSlide, extraSpace) {
                var offset = mathMax(parseInt10((totalSlides - extraSpace - numberOfVisibleSlides) / 2), 0);
                targetSlide = mod(targetSlide - offset, totalSlides);
                reorderSlides(targetSlide);
            }

            function centerTargetSlideAfter(targetSlide) {
                centerTargetSlideAdjusted(targetSlide, 0);
            }

            function centerTargetSlideBefore(targetSlide) {
                var startSlide = mathMin(targetSlide, currentSlide);
                var adjustment = mathAbs(targetSlide - currentSlide);

                centerTargetSlideAdjusted(startSlide, adjustment);
            }


            function performAnimation(dir, speed, clicked, prevNext, skipPreCenterTargetSlide) {
                if (option[30]/*updateBefore*/) setCurrent(dir);

                if (option[27]/*history*/ && clicked) win.location.hash = option[19]/*numerictext*/[dir];

                if (option[5]/*controlsfade*/) fadeControls(dir, option[4]/*controlsfadespeed*/);

                var fromSlides = $();
                var toSlides = $();
                for (var a = 0; a < numberOfVisibleSlides; a++) {
                    fromSlides = fromSlides.add(slides[getRealPos(currentSlide + a)]);
                    toSlides = toSlides.add(slides[getRealPos(dir + a)]);
                }


                // Finding a "shortcut", used for calculating the offsets.
                var diff = -currentSlide + dir;
                var targetSlide;
                if (option[16]/*continuous*/ && !prevNext) {
                    var diffAbs = mathAbs(diff);
                    targetSlide = dir;

                    var newDiff = -currentSlide + dir + totalSlides;
                    if (mathAbs(newDiff) < diffAbs) {
                        targetSlide = dir + totalSlides;
                        diff = newDiff;
                        diffAbs = mathAbs(diff);
                    }

                    newDiff = -currentSlide + dir - totalSlides;
                    if (mathAbs(newDiff) < diffAbs) {
                        targetSlide = dir - totalSlides;
                        diff = newDiff;
                    }
                } else {
                    targetSlide = dir;
                }

                if (option[16]/*continuous*/ && !skipPreCenterTargetSlide) {
                    centerTargetSlideBefore(targetSlide);
                }

                var leftTarget = getSlidePosition(targetSlide, FALSE);
                var topTarget = getSlidePosition(targetSlide, TRUE);

                var targetLi = slides[getRealPos(dir)];
                var callOptions = $.extend(TRUE, {}, options); // Making a copy, to enforce read-only.
                var overwritingSpeed = option[1]/*speed*/;
                var attributeSpeed = targetLi.attr("data-speed");
                if (attributeSpeed != undefined) {
                    overwritingSpeed = parseInt10(attributeSpeed);
                }
                if (speed != undefined) {
                    overwritingSpeed = parseInt10(speed);
                }
                callOptions.speed = overwritingSpeed;

                var effect = option[0]/*effect*/;

                var specificEffectAttrName = "data-effect";
                var slideSpecificEffect = targetLi.attr(specificEffectAttrName);
                if (slideSpecificEffect) {
                    effect = getEffectMethod(slideSpecificEffect);
                }

                var slideOutSlide = slides[currentSlide];
                if (slideOutSlide) {
                    var slideOutSpecificEffect = slides[currentSlide].attr(specificEffectAttrName + "out")
                    if (slideOutSpecificEffect) {
                        effect = getEffectMethod(slideOutSpecificEffect);
                    }
                }

                currentlyAnimating = TRUE;
                currentAnimation = effect;

                var callbackHasYetToRun = TRUE;
                currentAnimationCallback = function () {
                    currentlyAnimating = FALSE;
                    callbackHasYetToRun = FALSE;

                    goToSlide(dir, clicked);
                    fixClearType(toSlides);

                    if (option[16]/*continuous*/) {
                        centerTargetSlideAfter(targetSlide);
                    }

                    // afteranimation
                    aniCall(dir, TRUE);
                    if (option[11]/*responsive*/) {
                        adjustResponsiveLayout();
                    }

                    performCallbacks(runAfterAnimationCallbacks);
                };
                currentAnimationObject = {
                    fromSlides: fromSlides,
                    toSlides: toSlides,
                    slider: obj,
                    container: slidesContainer,
                    options: callOptions,
                    to: dir + 1,
                    from: currentSlide + 1,
                    diff: diff,
                    target: {
                        left: leftTarget,
                        top: topTarget
                    },
                    stopCallbacks: [],
                    callback: function () {
                        if (callbackHasYetToRun) {
                            callbackHasYetToRun = FALSE;
                            stopAnimation();
                        }
                    },
                    goToNext: function () {
                        if (callbackHasYetToRun) {
                            // Only moving after there is content ready to replace the previous.
                            runOnImagesLoaded($("." + ANIMATION_CLONE_MARKER_CLASS, obj), TRUE, makeCallback(adjustPositionTo, [dir]));
                        }
                    }
                };

                autoadjust(dir, overwritingSpeed);
                callAsync(function () {
                    // beforeanimation
                    aniCall(dir, FALSE, TRUE);

                    effect.call(baseSlider, currentAnimationObject);
                });
            }

            function stopAnimation() {
                if (currentlyAnimating) {
                    //noinspection JSUnusedAssignment
                    animationWasInterrupted = TRUE;
                    // Doing it in this order isn't a problem in relation to the user-callbacks, since they are run in a setTimeout(callback, 0) anyway.
                    currentAnimationCallback();

                    performCallbacks(currentAnimationObject.stopCallbacks);


                    var stopFunction = currentAnimation.stop;
                    if (stopFunction) {
                        stopFunction();
                    } else {
                        defaultStopFunction();
                    }
                    autoadjust(currentSlide, 0);
                    adjustPositionTo(currentSlide);
                    animationWasInterrupted = FALSE;
                }
            }

            function bindAndRegisterOff(element, events, handler, selector) {
                element.on(events, selector, handler);
                unBindCallbacks.push(function () {
                    element.off(events, selector, handler);
                });
            }


            function bindMultiple(element, func, events) {
                for (var i=0; i < events.length; i++) {
                    bindAndRegisterOff($(element), events[i], func);
                }
            }

            function cantDoAdjustments() {
                return !obj.is(":visible") || init;
            }

            function defaultStopFunction() {
                $("." + ANIMATION_CLONE_MARKER_CLASS, obj).remove();
                slidesContainer.stop();
            }

            function goToSlide(slide, clicked) {
                clickable = !clicked && !option[13]/*auto*/;
                previousSlide = currentSlide;
                currentSlide = slide;

                adjust(clicked);

                if (option[5]/*controlsfade*/ && init) {
                    fadeControls(currentSlide, 0);
                }
                // This is handles in AjaxAdjust, if something is loading.
                if (init && !option[31]/*ajax*/[currentSlide] && !startedAjaxLoads[currentSlide]) {
                    init = FALSE;
                    callAsync(performInitCallback);
                }
            }

            function getSlides(from, count) {
                var visibleSlides = $();
                for (var i = 0; i < count; i++) {
                    visibleSlides = visibleSlides.add(slides[getRealPos(from + i)]);
                }
                return visibleSlides;
            }

            function getRealPos(a) {
                return mod(a, totalSlides);
            }

            function fixClearType(element) {
                if (screen.fontSmoothingEnabled && element.style) element.style.removeAttribute("filter"); // Fix cleartype
            }

            /*
             * Public methods.
             */

            // First i just define those i use more than one. Then i just add the others as anonymous functions.
            function publicDestroy() {
                stopAnimation();
                destroyed = TRUE;
                slideNumberBeforeDestroy = currentSlide;

                performCallbacks(unBindCallbacks);

                ensureSliderContainerCSSDurationReset();

                if (controls) {
                    controls.remove();
                }

                reorderSlides(0);

                adjustPositionTo(currentSlide);
                autoadjust(currentSlide, 0);

                option[44]/*destroyCallback*/.call(baseSlider);
            }

            baseSlider.destroy = publicDestroy;

            function publicInit() {
                if (destroyed) {
                    initSudoSlider();
                }
            }

            baseSlider.init = publicInit;

            baseSlider.getOption = function (a) {
                return options[a.toLowerCase()];
            };

            baseSlider.setOption = function (name, val) {
                publicDestroy();
                if ($.isPlainObject(name)) {
                    for (var a in name) {
                        options[a] = name[a];
                    }
                } else {
                    options[name.toLowerCase()] = val;
                }
                publicInit();
            };

            baseSlider.runWhenNotAnimating = runWhenNotAnimating;

            baseSlider.insertSlide = function (html, pos, numtext, goToSlide) {
                publicDestroy();
                // pos = 0 means before everything else.
                // pos = 1 means after the first slide.
                // if pos is negative, then we count from the right instead.
                if (pos < 0) {
                    pos = totalSlides - mod(-pos - 1, totalSlides + 1);
                } else {
                    pos = mod(pos, totalSlides + 1);
                }

                html = $(html || "<div>");
                if (isSlideContainerUl) {
                    html = $("<li>").prepend(html);
                } else {
                    if (html.length != 1) {
                        html = $("<div>").prepend(html);
                    } else {
                        // Inserting as is.
                    }
                }

                if (!pos || pos == 0) {
                    slidesContainer.prepend(html);
                } else {
                    slides[pos - 1].after(html);
                }

                // Finally, we make it work again.
                if (goToSlide) {
                    slideNumberBeforeDestroy = goToSlide - 1;
                } else if (pos <= slideNumberBeforeDestroy || (!pos || pos == 0)) {
                    slideNumberBeforeDestroy++;
                }

                if (option[19]/*numerictext*/.length < pos) {
                    option[19]/*numerictext*/.length = pos;
                }

                option[19]/*numerictext*/.splice(pos, 0, numtext || parseInt10(pos) + 1);
                publicInit();
            };

            baseSlider.removeSlide = function (pos) {
                pos--; // 1 == the first.
                publicDestroy();

                slides[mathMin(pos, totalSlides - 1)].remove();
                option[19]/*numerictext*/.splice(pos, 1);
                if (pos < slideNumberBeforeDestroy) {
                    slideNumberBeforeDestroy--;
                }

                publicInit();
            };

            baseSlider.goToSlide = function (a, speed) {
                var parsedDirection = (a == parseInt10(a)) ? a - 1 : a;
                callAsync(makeCallback(enqueueAnimation, [parsedDirection, TRUE, speed]));
            };

            baseSlider.block = function () {
                clickable = FALSE;
            };

            baseSlider.unblock = function () {
                clickable = TRUE;
            };

            baseSlider.startAuto = function () {
                option[13]/*auto*/ = TRUE;
                startAuto();
            };

            baseSlider.stopAuto = function () {
                option[13]/*auto*/ = FALSE;
                stopAuto();
            };

            baseSlider.adjust = function () {
                var autoAdjustSpeed = mathMax(adjustTargetTime - getTimeInMillis(), 0);
                autoadjust(currentSlide, autoAdjustSpeed);
                if (!currentlyAnimating) {
                    adjustPositionTo(currentSlide);
                }
            };

            baseSlider.getValue = function (a) {
                return {
                    currentslide: currentSlide + 1,
                    totalslides: totalSlides,
                    clickable: clickable,
                    destroyed: destroyed,
                    autoanimation: autoOn
                }[a.toLowerCase()];
            };

            baseSlider.getSlide = function (number) {
                return slides[getRealPos(parseInt10(number) - 1)];
            };

            baseSlider.stopAnimation = stopAnimation;

            // Done, now initialize.
            initSudoSlider();
        });
    };
    /*
     * End generic slider. Start animations.
     * A lot of the code here is an if-else-elseif nightmare. This is because it is smaller in JavaScript, and this thing needs to be small (when minimized).
     */

    var GROW_IN = "GrowIn";
    var GROW_OUT = "GrowOut";
    var ROUNDED = "Rounded";

    // Start by defining everything, the implementations are below.
    var normalEffectsPrefixObject = {
        box: {
            Random: [
                "",
                GROW_IN,
                GROW_IN + ROUNDED,
                GROW_OUT,
                GROW_OUT + ROUNDED,
                boxRandomTemplate
            ],
            Rain: [
                "",
                GROW_IN,
                GROW_IN + ROUNDED,
                GROW_OUT,
                GROW_OUT + ROUNDED,
                "FlyIn",
                "FlyOut",
                [
                    "UpLeft",
                    "DownLeft",
                    "DownRight",
                    "UpRight",
                    boxRainTemplate
                ]
            ],
            Spiral: [
                "InWards",
                "OutWards",
                {
                    "": boxSpiralTemplate,
                    Grow: [
                        "In",
                        "Out",
                        [
                            "",
                            "Rounded",
                            boxSpiralGrowTemplate
                        ]
                    ]
                }
            ]
        },
        fade: {
            "": fade,
            OutIn: fadeOutIn
        },
        foldRandom: [
            "Horizontal",
            "Vertical",
            foldRandom
        ],
        slide: slide,
        stack: [
            "Up",
            "Right",
            "Down",
            "Left",
            [
                "",
                "Reverse",
                stackTemplate
            ]
        ]
    }

    // Generic effects needs to have a "dir" attribute as their last argument.
    var genericEffectsPrefixObject = {
        blinds: [
            "1",
            "2",
            blinds
        ],
        fold: fold,
        push:
            [
                "Out",
                "In",
                pushTemplate
            ],
        reveal: revealTemplate,
        slice: {
            "": [
                "",
                "Reveal",
                [
                    "",
                    "Reverse",
                    "Random",
                    slice
                ]
            ],
            Fade: slicesFade
        },
        zip: zip,
        unzip: unzip
    }


    function parsePrefixedEffects(resultObject, effectsObject, prefix, generic, argumentsStack) {
        if (isFunction(effectsObject)) {
            if (generic) {
                // Parsing the value 0, as a hack to make generic effects work, see the below else case.
                parsePrefixedEffects(resultObject, ["", "Up", "Right", "Down", "Left", effectsObject], prefix, 0, argumentsStack);
            } else {
                resultObject[prefix] = function (obj) {
                    var argumentArray = [obj].concat(argumentsStack);

                    // Ugly hack, to make "generic" functions to work.
                    var genericArgumentIndex = (argumentArray.length - 1);
                    if (generic === 0 && argumentArray[genericArgumentIndex] == 0) {
                        argumentArray[genericArgumentIndex] = getDirFromAnimationObject(obj);
                    }

                    effectsObject.apply(this, argumentArray);
                }
            }
        } else if (isArray(effectsObject)) {
            var effectIndex = effectsObject.length - 1;
            var effect = effectsObject[effectIndex];
            for (var i = 0; i < effectIndex; i++) {
                var newArgumentStack = cloneArray(argumentsStack);
                newArgumentStack.push(i);
                var name = effectsObject[i];
                parsePrefixedEffects(resultObject, effect, prefix + name, generic, newArgumentStack);
            }
        } else {
            $.each(effectsObject, function (name, effect) {
                parsePrefixedEffects(resultObject, effect, prefix + name, generic, argumentsStack);
            });
        }
    }


    var allEffects = {};
    parsePrefixedEffects(allEffects, genericEffectsPrefixObject, "", TRUE, []);
    parsePrefixedEffects(allEffects, normalEffectsPrefixObject, "", FALSE, []);

    allEffects.random = makeRandomEffect(allEffects);

    // Saving it.
    $.fn.sudoSlider.effects = allEffects;


    // The implementations
    // dir: 0: UpRight, 1: DownRight: 2: DownLeft, 3: UpLeft
    // effect: 0: none, 1: growIn, 2: growRoundedIn, 3: growOut, 4: growRoundedOut, 5: flyIn, 6: flyOut
    function boxRainTemplate(obj, effect, dir) {
        var reverseRows = dir == 1 || dir == 3;
        var reverse = dir == 0 || dir == 3;
        var grow = effect >= 1 && effect <= 4;
        var flyIn = effect == 5 || effect == 6;
        var reveal = effect == 6 || effect == 3  || effect == 4;
        var roundedGrow = effect == 2 || effect == 4;
        boxTemplate(obj, reverse, reverseRows, grow, FALSE, 1, flyIn, reveal, roundedGrow);
    }

    function boxSpiralTemplate(obj, direction) {
        boxTemplate(obj, direction, FALSE, FALSE, FALSE, 2, FALSE, FALSE, FALSE);
    }

    function boxSpiralGrowTemplate(obj, direction, reveal, rounded) {
        boxTemplate(obj, direction, FALSE, TRUE, FALSE, 2, FALSE, reveal, rounded);
    }

    // effect: 0: no grow, 1: growIn: 2: growInRounded, 3: growOut, 4: growOutRounded
    function boxRandomTemplate(obj, effect) {
        var reveal = effect == 3 || effect == 4;
        var roundedGrow = effect == 2 || effect == 4;
        boxTemplate(obj, FALSE, FALSE, effect != 0, TRUE, 0, FALSE, reveal, roundedGrow);
    }

    // SelectionAlgorithm: 0: Standard selection, 1: rain, 2: spiral
    function boxTemplate(obj, reverse, reverseRows, grow, randomize, selectionAlgorithm, flyIn, reveal, roundedGrow) {
        var options = obj.options;
        var ease = options.ease;
        var boxRows = options.boxrows;
        var boxCols = options.boxcols;
        var totalBoxes = boxRows * boxCols;
        var speed = options.speed / (totalBoxes == 1 ? 1 : 2.5); // To make the actual time spent equal to options.speed.
        var boxes = createBoxes(obj, boxCols, boxRows, !reveal);
        var timeBuff = 0;
        var rowIndex = 0;
        var colIndex = 0;
        var box2DArr = [];
        box2DArr[rowIndex] = [];
        if (reverse) {
            reverseArray(boxes);
        }
        if (randomize) {
            shuffle(boxes);
        }


        boxes.each(function () {
            box2DArr[rowIndex][colIndex] = this;
            colIndex++;
            if (colIndex == boxCols) {
                if (reverseRows) {
                    reverseArray(box2DArr[rowIndex]);
                }
                rowIndex++;
                colIndex = 0;
                box2DArr[rowIndex] = [];
            }
        });

        var boxesResult = [];
        if (selectionAlgorithm == 1) {
            // Rain
            for (var cols = 0; cols < (boxCols * 2) + 1; cols++) {
                var prevCol = cols;
                var boxesResultLine = [];
                for (var rows = 0; rows < boxRows; rows++) {
                    if (prevCol >= 0 && prevCol < boxCols) {
                        var rawBox = box2DArr[rows][prevCol];
                        if (!rawBox) {
                            return;
                        }
                        boxesResultLine.push(rawBox);
                    }
                    prevCol--;
                }
                if (boxesResultLine.length != 0) {
                    boxesResult.push(boxesResultLine);
                }
            }
        } else if (selectionAlgorithm == 2) {
            // Spiral
            // Algorithm borrowed from the Camera plugin by Pixedelic.com
            var rows2 = boxRows / 2, x, y, z, n = reverse ? totalBoxes : -1;
            var negative = reverse ? -1 : 1;
            for (z = 0; z < rows2; z++) {
                y = z;
                for (x = z; x < boxCols - z - 1; x++) {
                    boxesResult[n += negative] = boxes.eq(y * boxCols + x);
                }
                x = boxCols - z - 1;
                for (y = z; y < boxRows - z - 1; y++) {
                    boxesResult[n += negative] = boxes.eq(y * boxCols + x);
                }
                y = boxRows - z - 1;
                for (x = boxCols - z - 1; x > z; x--) {
                    boxesResult[n += negative] = boxes.eq(y * boxCols + x);
                }
                x = z;
                for (y = boxRows - z - 1; y > z; y--) {
                    boxesResult[n += negative] = boxes.eq(y * boxCols + x);
                }
            }
        } else {
            for (var row = 0; row < boxRows; row++) {
                for (var col = 0; col < boxCols; col++) {
                    boxesResult.push([box2DArr[row][col]]);
                }
            }
        }

        if (reveal) {
            obj.goToNext();
        }

        var count = 0;
        for (var i = 0; i < boxesResult.length; i++) {
            var boxLine = boxesResult[i];
            for (var j = 0; j < boxLine.length; j++) {
                var box = $(boxLine[j]);
                (function (box, timeBuff) {
                    var boxChildren = box.children();
                    var orgWidth = box.width();
                    var orgHeight = box.height();
                    var goToWidth = orgWidth;
                    var goToHeight = orgHeight;
                    var orgLeft = parseNumber(box.css("left"));
                    var orgTop = parseNumber(box.css("top"));
                    var goToLeft = orgLeft;
                    var goToTop = orgTop;

                    var childOrgLeft = parseNumber(boxChildren.css("left"));
                    var childOrgTop = parseNumber(boxChildren.css("top"));
                    var childGoToLeft = childOrgLeft;
                    var childGoToTop = childOrgTop;

                    if (flyIn) {
                        var adjustLeft = reverse != reverseRows ? -goToWidth : goToWidth;
                        var adjustTop = reverse ? -goToHeight : goToHeight;

                        var flyDistanceFactor = 1.5;

                        if (reveal) {
                            goToLeft -= adjustLeft * flyDistanceFactor;
                            goToTop -= adjustTop * flyDistanceFactor;
                        } else {
                            box.css({left: orgLeft + adjustLeft * flyDistanceFactor, top: orgTop + adjustTop * flyDistanceFactor});
                        }
                    }

                    if (grow) {
                        if (reveal) {
                            childGoToLeft -= goToWidth / 2;
                            goToLeft += goToWidth / 2;
                            childGoToTop -= goToHeight / 2;
                            goToTop += goToHeight / 2;

                            goToHeight = goToWidth = 0;
                        } else {
                            box.css({left: orgLeft + (goToWidth / 2), top: orgTop + (goToHeight / 2)});
                            boxChildren.css({left: childOrgLeft - goToWidth / 2, top: childOrgTop - goToHeight / 2});

                            box.width(0).height(0);
                            if (roundedGrow) {
                                box.css({borderRadius: mathMax(orgHeight, orgWidth)});
                            }
                        }
                    }


                    if (reveal) {
                        box.css({opacity: 1});
                    }
                    count++;
                    setTimeout(function () {
                        animate(boxChildren, {left: childGoToLeft, top: childGoToTop}, speed, ease, FALSE, obj);
                        animate(box, {
                            opacity: reveal ? 0 : 1,
                            width: goToWidth,
                            height: goToHeight,
                            left: goToLeft,
                            top: goToTop,
                            borderRadius: grow && reveal && roundedGrow ? mathMax(orgHeight, orgWidth) : 0
                        }, speed, ease, function () {
                            count--;
                            if (count == 0) {
                                obj.callback();
                            }
                        }, obj);
                    }, timeBuff);
                })(box, timeBuff);
            }
            timeBuff += (speed / boxesResult.length) * 1.5;
        }
    }

    function slicesFade(obj, dir) {
        var vertical = dir == 2 || dir == 4;
        var negative = dir == 1 || dir == 4;
        foldTemplate(obj, vertical, negative, FALSE, TRUE);
    }

    function fold(obj, dir) {
        var vertical = dir == 2 || dir == 4;
        var negative = dir == 1 || dir == 4;
        foldTemplate(obj, vertical, negative);
    }

    function foldRandom(obj, vertical) {
        foldTemplate(obj, vertical, FALSE, TRUE);
    }

    function blinds(obj, blindsEffect, dir) {
        blindsEffect++;
        var vertical = dir == 2 || dir == 4;
        var negative = dir == 1 || dir == 4;
        foldTemplate(obj, vertical, negative, FALSE, FALSE, blindsEffect);
    }

    function slice(obj, reveal, reverse, dir) {
        var random = reverse == 2;
        var vertical = dir == 1 || dir == 3;
        var negative = dir == 1 || dir == 4;
        foldTemplate(obj, vertical, reverse, random, FALSE, 0, negative ? 1 : 2, reveal);
    }

    function zip(obj, dir) {
        var vertical = dir == 2 || dir == 4;
        var negative = dir == 1 || dir == 4;
        foldTemplate(obj, vertical, negative, FALSE, FALSE, 0, 3);
    }

    function unzip(obj, dir) {
        var vertical = dir == 2 || dir == 4;
        var negative = dir == 1 || dir == 4;
        foldTemplate(obj, vertical, negative, FALSE, FALSE, 0, 3, TRUE);
    }

    function foldTemplate(obj, vertical, reverse, randomize, onlyFade, curtainEffect, upDownEffect, reveal) {
        var options = obj.options;
        var slides = options.slices;
        var speed = options.speed / 2; // To make the actual time spent be equal to options.speed
        var ease = options.ease;
        var objSlider = obj.slider;
        var slicesElement = createBoxes(obj, vertical ? slides : 1, vertical ? 1 : slides, !reveal);
        var count = 0;
        var upDownAlternator = FALSE;
        if (reverse) {
            reverseArray(slicesElement);
        } else {
            $(reverseArray(slicesElement.get())).appendTo(objSlider);
        }
        if (randomize) {
            shuffle(slicesElement);
        }
        slicesElement.each(function (i) {
            var timeout = ((speed / slides) * i);
            var slice = $(this);
            var orgWidth = slice.width();
            var orgHeight = slice.height();
            var goToLeft = slice.css("left");
            var goToTop = slice.css("top");
            var startPosition = vertical ? goToLeft : goToTop;

            var innerBox = slice.children();
            var startAdjustment = innerBox[vertical ? "width" : "height"]();
            if (curtainEffect == 1) {
                startPosition = 0
            } else if (curtainEffect == 2) {
                startPosition = startAdjustment / 2;
            }
            if (reverse) {
                startPosition = startAdjustment - startPosition;
            }
            if (vertical) {
                slice.css({
                    width: (onlyFade || upDownEffect ? orgWidth : 0),
                    left: startPosition
                });
            } else {
                slice.css({
                    height: (onlyFade || upDownEffect ? orgHeight : 0),
                    top: startPosition
                });
            }

            if (reveal) {
                var negative = upDownEffect == 1 ? -1 : 1;
                slice.css({
                    top: goToTop,
                    left: goToLeft,
                    width: orgWidth,
                    height: orgHeight,
                    opacity: 1
                });
                if (vertical) {
                    goToTop = negative * orgHeight;
                } else {
                    goToLeft = negative * orgWidth;
                }
            }

            if (upDownEffect) {
                var bottom = TRUE;
                if (upDownEffect == 3) {
                    if (upDownAlternator) {
                        bottom = FALSE;
                        upDownAlternator = FALSE;
                    } else {
                        upDownAlternator = TRUE;
                    }
                } else if (upDownEffect == 2) {
                    bottom = FALSE;
                }
                if (vertical) {
                    if (reveal) {
                        goToTop = (bottom ? -1 : 1) * orgHeight;
                    } else {
                        slice.css({
                            bottom: bottom ? 0 : orgHeight,
                            top: bottom ? orgHeight : 0,
                            height: reveal ? orgHeight : 0
                        });
                    }
                } else {
                    if (reveal) {
                        goToLeft = (bottom ? -1 : 1) * orgWidth;
                    } else {
                        slice.css({
                            right: bottom ? 0 : orgWidth,
                            left: bottom ? orgWidth : 0,
                            width: reveal ? orgWidth : 0
                        });
                    }
                }
            }


            count++;
            setTimeout(makeCallback(animate, [
                slice, {
                    width: orgWidth,
                    height: orgHeight,
                    opacity: reveal ? 0 : 1,
                    left: goToLeft,
                    top: goToTop
                }, speed, ease, function () {
                    count--;
                    if (count == 0) {
                        obj.callback();
                    }
                }, obj])
            , timeout);
        });
        if (reveal) {
            obj.goToNext();
        }
    }

    function stackTemplate(obj, dir, reverse) {
        var pushIn = obj.diff > 0;
        if (reverse) {
            pushIn = !pushIn;
        }

        pushTemplate(obj, pushIn, ++dir);
    }

    // 1: up, 2: right, 3: down, 4, left:
    function pushTemplate(obj, pushIn, dir) {
        var vertical = dir == 2 || dir == 4;
        var negative = (dir == 2 || dir == 3) ? 1 : -1;
        var options = obj.options;
        var ease = options.ease;
        var speed = options.speed;
        if (pushIn) {
            var fromSlides = obj.fromSlides;
            var toSlides = makeClone(obj, TRUE).hide();
            toSlides.prependTo(obj.slider);
            var height = mathMax(toSlides.height(), fromSlides.height());
            var width = mathMax(toSlides.width(), fromSlides.width());
            toSlides.css(vertical ? {left: negative * width} : {top: negative * height}).show();
            animate(toSlides, {left: 0, top: 0}, speed, ease, obj.callback, obj);
        } else {
            var fromSlides = makeClone(obj, FALSE);
            fromSlides.prependTo(obj.slider);
            obj.goToNext();
            var toSlides = obj.toSlides;

            var measurementSlides = negative == -1 ? fromSlides : toSlides;
            var height = measurementSlides.height();
            var width = measurementSlides.width();

            animate(fromSlides, vertical ? {left: negative * width} : {top: negative * height}, speed, ease, obj.callback, obj);
        }
    }

    function revealTemplate(obj, dir) {
        var vertical = dir == 1 || dir == 3;
        var options = obj.options;
        var ease = options.ease;
        var speed = options.speed;
        var innerBox = makeClone(obj, TRUE);
        var width = innerBox.width();
        var height = innerBox.height();
        var box = makeBox(innerBox, 0, 0, 0, 0, obj)
            .css({opacity: 1})
            .appendTo(obj.slider);
        var both = box.add(innerBox);
        both.hide(); // FF css animation fix
        if (vertical) {
            box.css({width: width});
            if (dir == 1) {
                innerBox.css({top: -height});
                box.css({bottom: 0, top: "auto"});
            }
        } else {
            box.css({height: height});
            if (dir == 4) {
                innerBox.css({left: -width});
                box.css({right: 0, left: "auto"});
            }
        }
        // <FF css animation fix>
        both.show();
        if (vertical) {
            both.width(width);
        } else {
            both.height(height);
        }
        // </FF css animation fix>
        animate(innerBox, {left: 0, top: 0}, speed, ease, FALSE, obj);
        animate(box, {width: width, height: height}, speed, ease, obj.callback, obj);
    }

    function slide(obj) {
        var ul = childrenNotAnimationClones(obj.slider);
        var options = obj.options;
        var ease = options.ease;
        var speed = options.speed;
        var target = obj.target;

        var left = target.left;
        var top = target.top;

        if (obj.options.usecss) {
            animate(ul, {transform: "translate(" + left + "px, " + top + "px)"}, speed, ease, obj.callback, obj, TRUE);
        } else {
            animate(ul, {marginTop: top, marginLeft: left}, speed, ease, obj.callback, obj);
        }
    }

    function animate(elem, properties, speed, ease, callback, obj, doNotResetCss) {
        var usecss = !obj || obj.options.usecss;
        if (CSSVendorPrefix === FALSE || !usecss) {
            elem.animate(properties, speed, ease, callback);
            return;
        }

        var CSSObject = {};
        var transitionProperty = CSSVendorPrefix + "transition";
        var keys = getKeys(properties);
        // Adding vendor prefix, because sometimes it's needed.
        CSSObject[transitionProperty] = keys.join(" ") + (CSSVendorPrefix == "" ? "" : " " + CSSVendorPrefix + keys.join(" " + CSSVendorPrefix));

        var transitionTiming = transitionProperty + "-duration";
        CSSObject[transitionTiming] = speed + "ms";

        var transitionEase = transitionProperty + "-timing-function";
        if (ease == "swing") {
            ease = "ease-in-out";
        }
        CSSObject[transitionEase] = ease;

        function resetCSS() {
            if (!doNotResetCss) {
                var cssObject = {};
                cssObject[transitionTiming] = "0s";
                cssObject[transitionEase] = "";
                cssObject[transitionProperty] = "";
                elem.css(cssObject);
            }
        }

        if (obj) {
            obj.stopCallbacks.push(resetCSS);
        }

        var eventsVendorPrefix = CSSVendorPrefix.replace(/\-/g, ""); // replaces all "-" with "";
        var eventsSuffix = (eventsVendorPrefix ? "T" : "t") + "ransitionend";
        var events = eventsVendorPrefix + eventsSuffix + " t" + "ransitionend";

        var called = FALSE;
        var callbackFunction = function () {
            if (!called) {
                called = TRUE;
                elem.unbind(events);
                resetCSS();
                if (callback) {
                    callback();
                }
            }
        };

        callAsync(function () {
            if (speed < 20) { // If instant animation
                elem.css(properties);
                callbackFunction();
                return;
            }
            elem.css(CSSObject);

            callAsync(function () {
                elem.css(properties);

                elem.on(events, function (event) {
                    if (elem.is(event.target)) {
                        callbackFunction();
                    }
                });
                // If the animation doesn't do anything, the bind will never be triggered, so this is a fallback.
                setTimeout(callbackFunction, speed + 100);
            });
        });
        return callbackFunction
    }

    function fadeOutIn(obj) {
        var options = obj.options;
        var fadeSpeed = options.speed;
        var ease = options.ease;

        var fadeinspeed = parseInt10(fadeSpeed * (3 / 5));
        var fadeoutspeed = fadeSpeed - fadeinspeed;

        obj.stopCallbacks.push(function () {
            obj.fromSlides.stop().css({opacity: 1});
        });

        animate(obj.fromSlides, { opacity: 0.0001 }, fadeoutspeed, ease, makeCallback(finishFadeAnimation, [obj, fadeSpeed]), obj);
    }


    function fade(obj) {
        finishFadeAnimation(obj, obj.options.speed);
    }

    function finishFadeAnimation(obj, speed) {
        var options = obj.options;
        options.boxcols = 1;
        options.boxrows = 1;
        options.speed = speed;
        boxTemplate(obj, FALSE);
    }

    // 1: up, 2: right, 3: down, 4, left:
    function getDirFromAnimationObject(obj) {
        var vertical = obj.options.vertical;
        var diff = obj.diff;
        var dir;
        if (vertical) {
            if (diff < 0) {
                dir = 1;
            } else {
                dir = 3;
            }
        } else {
            if (diff < 0) {
                dir = 2;
            } else {
                dir = 4;
            }
        }
        return dir;
    }


    function createBoxes(obj, numberOfCols, numberOfRows, useToSlides) {
        var slider = obj.slider;
        var result = $();
        var boxWidth, boxHeight;
        var first = TRUE;
        for (var rows = 0; rows < numberOfRows; rows++) {
            for (var cols = 0; cols < numberOfCols; cols++) {
                var innerBox = makeClone(obj, useToSlides);

                if (first) {
                    first = FALSE;
                    boxWidth = Math.ceil(innerBox.width() / numberOfCols);
                    boxHeight = Math.ceil(innerBox.height() / numberOfRows);
                }

                var box = makeBox(
                    innerBox, // innerBox
                        boxHeight * rows, // top
                        boxWidth * cols, // left
                    boxHeight, // height
                    boxWidth, // width
                    obj // for options.
                );
                slider.append(box);
                result = result.add(box);
            }
        }
        return result;
    }

    function makeBox(innerBox, top, left, height, width, obj) {
        innerBox.css({
            width: innerBox.width(),
            height: innerBox.height(),
            display: "block",
            top: -top,
            left: -left
        });
        var box = $("<div>").css({
            left: left,
            top: top,
            width: width,
            height: height,
            opacity: 0,
            overflow: HIDDEN_STRING,
            position: ABSOLUTE_STRING,
            zIndex: findCloneZIndex(obj)
        });
        box.append(innerBox).addClass(ANIMATION_CLONE_MARKER_CLASS);
        return box;
    }

    // Makes a single box that contains clones of the toSlides/fromSlides. Positioned correctly relative to each other. And the returned box has the correct height and width.
    function makeClone(obj, useToSlides) {
        var slides = useToSlides ? obj.toSlides : obj.fromSlides;
        var firstSlidePosition = slides.eq(0).position();
        var orgLeft = firstSlidePosition.left;
        var orgTop = firstSlidePosition.top;
        var height = 0;
        var width = 0;
        var result = $("<div>").css({zIndex: findCloneZIndex(obj), position: ABSOLUTE_STRING, top: 0, left: 0}).addClass(ANIMATION_CLONE_MARKER_CLASS);
        slides.each(function (index, elem) {
            var that = $(elem);
            var cloneWidth = that.outerWidth(TRUE);
            var cloneHeight = that.outerHeight(TRUE);
            var clone = that.clone();
            var position = that.position();
            var left = position.left - orgLeft;
            var top = position.top - orgTop;
            clone.css({position: ABSOLUTE_STRING, left: left, top: top, opacity: 1});
            height = mathMax(height, top + cloneHeight);
            width = mathMax(width, left + cloneWidth);
            result.append(clone);
        });
        result.width(width).height(height);
        return result;
    }

    function findCloneZIndex(obj) {
        return (parseInt10(obj.container.css("zIndex")) || 0) + 1;
    }


    /*
     * Util scripts.
     */

    function makeCallback(func, args) {
        return function () {
            func.apply(undefined, args);
        }
    }

    function runOnImagesLoaded(target, waitForAllImages, callback) {
        if (!target) {
            callback();
            return;
        }
        var elems = target.add(target.find("img")).filter("img");
        var numberOfRemainingImages = elems.length;
        if (!numberOfRemainingImages) {
            callback();
            return;
        }

        elems.each(function () {
            var that = this;
            var jQueryThat = $(that);
            var events = "load error";
            var loadFunction = function () {
                jQueryThat.off(events, loadFunction);
                if (waitForAllImages) {
                    numberOfRemainingImages--;
                    if (numberOfRemainingImages == 0) {
                        callback();
                    }
                } else {
                    callback();
                }
            };
            jQueryThat.on(events, loadFunction);
            /*
             * Start ugly working IE fix.
             */
            if (that.readyState == "complete") {
                jQueryThat.trigger("load");
            } else if (that.readyState) {
                // Sometimes IE doesn't fire the readystatechange, even though the readystate has been changed to complete. AARRGHH!! I HATE IE, I HATE IT, I HATE IE!
                that.src = that.src; // Do not ask me why this works, ask the IE team!
            }
            /*
             * End ugly working IE fix.
             */
            else if (that.complete) {
                jQueryThat.trigger("load");
            }
            else if (that.complete === undefined) {
                var src = that.src;
                // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
                // data uri bypasses webkit log warning (thx doug jones)
                that.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                that.src = src;
            }
        });
    }

    // The minVersion is specified in an array, like [1, 8, 0] for 1.8.0
    // Partially copy-pasted from: https://gist.github.com/dshaw/652870
    function minJQueryVersion(minVersion) {
        var version = $.fn.jquery.split(".");
        var length = version.length
        for (var a = 0; a < length; a++) {
            if (minVersion[a] && +version[a] < +minVersion[a]) {
                return FALSE;
            }
        }
        return TRUE;
    }

    function getVendorPrefixedProperty(property, searchElement) {
        for (var name in searchElement) {
            if (endsWith(name.toLowerCase(), property.toLowerCase())) {
                return name;
            }
        }
        return FALSE;
    }

    function getCSSVendorPrefix() {
        var property = "transition";
        var styleName = getVendorPrefixedProperty(property, $("<div>")[0].style);
        if (styleName === FALSE) {
            return FALSE;
        }
        var prefix = styleName.slice(0, styleName.length - property.length);
        if (prefix.length != 0) {
            return "-" + prefix + "-";
        }
        return "";
    }

    function stringTrim(str) {
        return str.replace(/^\s+|\s+$/g, '');
    }

    function endsWith(string, suffix) {
        return string.indexOf(suffix, string.length - suffix.length) !== -1;
    }

    function getKeys(obj) {
        var keys = [];
        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    }

    // Puts the specified function in a setTimeout([function], 0);
    function callAsync(func) {
        setTimeout(func, 0);
    }

    function startsWith(string, prefix) {
        return string.indexOf(prefix) == 0;
    }

    function cloneArray(arrayToClone) {
        return arrayToClone.slice();
    }

    // This mutates the given array, so that it is reversed.
    // It also returns it.
    function reverseArray(array) {
        return [].reverse.call(array);
    }

    function childrenNotAnimationClones(obj) {
        return obj.children().not("." + ANIMATION_CLONE_MARKER_CLASS);
    }

    function objectToLowercase(obj) {
        var ret = {};
        for (var key in obj)
            ret[key.toLowerCase()] = obj[key];
        return ret;
    }

    // Mutates and returns the array.
    function shuffle(array) {
        for (var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x) {
        }
        return array;
    }

    function isFunction(func) {
        return $.isFunction(func);
    }

    function isArray(object) {
        return $.isArray(object);
    }

    function parseInt10(num) {
        return parseInt(num, 10);
    }

    function parseNumber(num) {
        return parseFloat(num);
    }

    function getTimeInMillis() {
        return +new Date();
    }

    // Actual modulo, not remainder. From here: http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
    // Added a or zero, to ensure it returns a number.
    function mod(a, n) {
        return (((a % n) + n) % n) || 0;
    }

    function mathAbs(number) {
        return number < 0 ? -number : number;
    }

    function mathMax(a, b) {
        return a > b ? a : b;
    }

    function mathMin(a, b) {
        return a < b ? a : b;
    }

    function getEffectMethod(inputEffect) {
        if (isArray(inputEffect)) {
            return makeRandomEffect(inputEffect);
        } else if (isFunction(inputEffect)) {
            return inputEffect
        } else /* if (typeof inputEffect === "string") */{
            inputEffect = stringTrim(inputEffect);
            if (inputEffect.indexOf(",") != -1) {
                var array = inputEffect.split(",");
                return makeRandomEffect(array);
            } else {
                var effects = objectToLowercase($.fn.sudoSlider.effects);
                var effectName = inputEffect.toLowerCase();
                var result = effects[effectName];
                if (result) {
                    return result;
                } else {
                    var array = [];
                    for (var name in effects) {
                        if (startsWith(name, effectName)) {
                            array.push(effects[name]);
                        }
                    }
                    if (!array.length) {
                        return slide;
                    }
                    return makeRandomEffect(array);
                }
            }
        }
    }

    function makeRandomEffect(array) {
        return function (obj) {
            var effect = pickRandomValue(array);
            return getEffectMethod(effect)(obj);
        }
    }

    function pickRandomValue(obj) {
        return obj[shuffle(getKeys(obj))[0]];
    }

    // From this guy: https://github.com/rdallasgray/bez
    // Inlined into my own script to make it shorter.
    function makeBezier(coOrdArray) {
        var encodedFuncName = "bez_" + coOrdArray.join("_").replace(/\./g, "p");
        var jqueryEasing = $.easing;
        if (!isFunction(jqueryEasing[encodedFuncName])) {
            var	polyBez = function(p1, p2) {
                var A = [0, 0];
                var B = [0, 0];
                var C = [0, 0];
                function bezCoOrd(t, ax) {
                    C[ax] = 3 * p1[ax], B[ax] = 3 * (p2[ax] - p1[ax]) - C[ax], A[ax] = 1 - C[ax] - B[ax];
                    return t * (C[ax] + t * (B[ax] + t * A[ax]));
                }
                function xDeriv(t) {
                    return C[0] + t * (2 * B[0] + 3 * A[0] * t);
                }
                function xForT(t) {
                    var x = t, i = 0, z;
                    while (++i < 14) {
                        z = bezCoOrd(x, 0) - t;
                        if (mathAbs(z) < 1e-3) break;
                        x -= z / xDeriv(x);
                    }
                    return x;
                }

                return function(t) {
                    return bezCoOrd(xForT(t), 1);
                }
            };
            jqueryEasing[encodedFuncName] = function(x, t, b, c, d) {
                return c * polyBez([coOrdArray[0], coOrdArray[1]], [coOrdArray[2], coOrdArray[3]])(t/d) + b;
            }
        }
        return encodedFuncName;
    }

})(jQuery, window);
// If you did just read the entire code, congrats.
// Did you find a bug? I didn't, so plz tell me if you did. (https://github.com/webbiesdk/SudoSlider/issues)