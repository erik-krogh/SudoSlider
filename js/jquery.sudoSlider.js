/*
 *  Sudo Slider ver 3.0.0 - jQuery plugin
 *  Written by Erik Kristensen info@webbies.dk.
 *  Based on Easy Slider 1.7 by Alen Grakalic http://cssglobe.com/post/5780/easy-slider-17-numeric-navigation-jquery-slider
 *  The two scripts doesn't share much code anymore (if any). But Sudo Slider is still based on it.
 *
 *	 Dual licensed under the MIT
 *	 and GPL licenses.
 *
 *	 Built for jQuery library
 *	 http://jquery.com
 *
 */
(function($) {
    var undefined; // Makes sure that undefined really is undefined within this scope.
    var FALSE = !1;
    var TRUE = !0;
	$.fn.sudoSlider = function(optionsOrg) {
		// Saves space in the minified version.
		// default configuration properties
		var defaults = {
			controlsshow:      TRUE, /* option[0]/*controlsShow*/
			controlsfadespeed: 400, /* option[1]/*controlsfadespeed*/
			controlsfade:      TRUE, /* option[2]/*controlsfade*/
			insertafter:       TRUE, /* option[3]/*insertafter*/
			firstshow:         FALSE, /* option[4]/*firstshow*/
			lastshow:          FALSE, /* option[5]/*lastshow*/
			vertical:          FALSE, /* option[6]/*vertical*/
			speed:             800, /* option[7]/*speed*/
			ease:              'swing', /* option[8]/*ease*/
			auto:              FALSE, /* option[9]/*auto*/
			pause:             2000, /* option[10]/*pause*/
			continuous:        FALSE, /* option[11]/*continuous*/
			prevnext:          TRUE, /* option[12]/*prevnext*/
			numeric:           FALSE, /* option[13]/*numeric*/
			numericattr:       'class="controls"', /* option[14]/*numericattr*/
			numerictext:       [], /* option[15]/*numerictext*/
			history:           FALSE, /* option[16]/*history*/
			speedhistory:      400, /* option[17]/*speedhistory*/
			autoheight:        TRUE, /* option[18]/*autoheight*/
			customlink:        FALSE, /* option[19]/*customlink*/
			fade:              FALSE, /* option[20]/*fade*/
			crossfade:         TRUE, /* option[21]/*crossfade*/
			fadespeed:         1000, /* option[22]/*fadespeed*/
			updatebefore:      FALSE, /* option[23]/*updateBefore*/
			ajax:              FALSE, /* option[24]/*ajax*/
			preloadajax:       500, /* option[25]/*preloadajax*/
			startslide:        FALSE, /* option[26]/*startslide*/
			ajaxloadfunction:  FALSE, /* option[27]/*ajaxloadfunction*/
			beforeanifunc:     FALSE, /* option[28]/*beforeanifunc*/
			afteranifunc:      FALSE, /* option[29]/*afteranifunc*/
			uncurrentfunc:     FALSE, /* option[30]/*uncurrentfunc*/
			currentfunc:       FALSE, /* option[31]/*currentfunc*/
			prevhtml:          '<a href="#" class="prevBtn"> previous </a>', /* option[32]/*prevhtml*/
			nexthtml:          '<a href="#" class="nextBtn"> next </a>', /* option[33]/*nexthtml*/
			loadingtext:       '', /* option[34]/*loadingtext*/
			firsthtml:         '<a href="#" class="firstBtn"> first </a>', /* option[35]/*firsthtml*/
			controlsattr:      'id="controls"', /* option[36]/*controlsattr*/
			lasthtml:          '<a href="#" class="lastBtn"> last </a>', /* option[37]/*lasthtml*/
			autowidth:         TRUE, /*  option[38]/*autowidth*/
			slidecount:        1, /*  option[39]/*slidecount*/
			resumepause:       FALSE, /* option[40]/*resumepause*/
			movecount:         1, /* option[41]/*movecount*/
			responsive:        FALSE,  /* option[42]/*responsive*/
			customfx:          FALSE,  /* option[43]/*customFx*/
			slices:            15,  /* option[44]/*slices*/
            boxcols:           8,  /* option[45]/*boxCols*/
            boxrows:           4  /* option[46]/*boxRows*/
		};
		// Defining the base element.
		var baseSlider = this;
		// This object holds all the callback functions, each field in the object is an array of functions.
		var publicMethods = {};
		// Adds a public method to the base element, to allow methods calls to be made on the returned object.
		function addMethod(name, func) {
			if (publicMethods[name]) {
				publicMethods[name].push(func);
			} else {
				// No function, lets first make an array in the publicMethods object.
				publicMethods[name] = [func];
				// Defining the method that is actually called. Its only responsibility is to call the specified methods and make sure to return something meaningful.
				baseSlider[name] = function () {
					var functions = publicMethods[name];
					var returnvar;
					var numberofreturns = 0;
					for (var i = 0; i < functions.length; i++)
					{
						// Arguments is already defined, they are the arguments this method was called with.
						var tmpReturn = functions[i].apply(baseSlider, arguments);
						if (tmpReturn != undefined) {
							numberofreturns++;
							if (numberofreturns == 1) {
								returnvar = tmpReturn;
							} else if (numberofreturns == 2) {
								returnvar = [returnvar, tmpReturn];
							} else {
								returnvar.push(tmpReturn);
							}
						}
					}
					if (numberofreturns == 0) {
						return baseSlider;
					}
					return returnvar;
				};
			}
		}

		function objectToLowercase (obj) {
			var ret = {};
			for (var key in obj)
				ret[key.toLowerCase()] = obj[key];
			return ret;
		};

		optionsOrg = $.extend(defaults, objectToLowercase(optionsOrg));

		// Constants
		var PAGES_MARKER_STRING = "pages";
		var NEXT_STRING = "next";
		var PREV_STRING = "prev";
		var LAST_STRING = "last";
		var FIRST_STRING = "first";
		var HIDDEN_SELECTOR_STRING = ":hidden";
		var SELECTED_SELECTOR_STRING = ":visible";

		return this.each(function() {
		    var init,
			ul,
			li,
			liConti,
			s,
			t,
			ot,
			ts,
			clickable,
			buttonclicked,
			ajaxloading,
			numericControls,
			numericContainer,
			destroyed,
			destroyT,
			controls,
			firstbutton,
			lastbutton,
			nextbutton,
			prevbutton,
			timeout,
			oldSpeed,
			dontCountinue,
			autoOn,
			continuousClones = FALSE,
			numberOfVisibleSlides,
			beforeanifuncFired = FALSE,
			asyncTimedLoad,
			callBackList,
			obj = $(this),
			finishedAdjustingTo = FALSE, // This variable teels if the slider is currently adjusted (height and width) to any specific slide. This is usefull when ajax-loading stuff.
            adjustingTo, // This one tells what slide we are adjusting to, to make sure that we do not adjust to something we shouldn't.
            adjustTargetTime = 0, // This one holds the time that the autoadjust animation should complete.
            currentlyAnimating = FALSE,
            awaitingAjaxLoads = [],

			// Making a "private" copy that i put the "public" options in. The private options can then be changed if i wan't to.
			options = optionsOrg,
			option = [];
			initSudoSlider(obj, FALSE);
			function initSudoSlider(obj, destroyT) {
				// Storing the public options in an array.
				var i = 0;
				for (a in options) {
					option[i] = options[a];
					i++;
				}

				destroyed = FALSE;

				init = TRUE;

				// Fix for nested list items
				ul = obj.children("ul");
				// Is the ul element there?
				if (!ul.length) obj.append(ul = $("<ul></ul>"));

				li = ul.children("li");

				s = li.length;

				// Now we are going to fix the document, if it's 'broken'. (No <li>).
				// I assume that it's can only be broken, if ajax is enabled. If it's broken without Ajax being enabled, the script doesn't have anything to fill the holes.
				if (option[24]/*ajax*/) {
					// Do we have enough list elements to fill out all the ajax documents.
					if (option[24]/*ajax*/.length > s) {
						for (var a = 1; a <= option[24]/*ajax*/.length - s; a++) {
							ul.append("<li><p>" +  option[34]/*loadingtext*/ + "</p></li>");
						}
						li = ul.children("li");
						s = li.length;
					}
				}

				t = 0;
				ot = t;
				ts = s-1;

				clickable = TRUE;
				buttonclicked = FALSE;
				ajaxloading = FALSE;
				numericControls = [];
				destroyed = FALSE;

				// <strike>Set obj overflow to hidden</strike> (and position to relative <strike>, if fade is enabled. </strike>)
				// obj.css("overflow","hidden");
				if (obj.css("position") == "static") obj.css("position","relative"); // Fixed a lot of IE6 + IE7 bugs.

				// Float items to the left, and make sure that all elements are shown.
				li.css({'float': "left", 'display': 'block'});

				option[39]/*slidecount*/ = parseInt10(option[39]/*slidecount*/)

				// Lets just redefine slidecount
				numberOfVisibleSlides = option[39]/*slidecount*/;

				option[39]/*slidecount*/ += option[41]/*movecount*/ - 1;

				// startslide can only be a number (and not 0).
				option[26]/*startslide*/ = parseInt10(option[26]/*startslide*/) || 1;


                // Every animation is defined using customFx.
                // This if statement keeps backward compatibility.
				if (!option[43]/*customFx*/) {
				    option[43]/*customFx*/ = "slide";
				    if (option[20]/*fade*/) {
				        if (option[21]/*crossfade*/) {
				            option[43]/*customFx*/ = "crossFade";
				        } else {
				            option[43]/*customFx*/ = "fadeInOut";
				        }
				        option[20]/*fade*/ = FALSE;
				        option[7]/*speed*/ = option[22]/*fadespeed*/;
				    }
				}
				var sudoSliderEffects = $.fn.sudoSlider.effects;
				if ($.isArray(option[43]/*customFx*/)) {
				    var array = option[43]/*customFx*/;
                    option[43]/*customFx*/ = function (obj) {
                        var effect = pickRandomValue(array);
                        if (!isFunc(effect)) {
                            effect = sudoSliderEffects[effect];
                        }
                        return effect(obj);
                    }
				} else {
				    option[43]/*customFx*/ = sudoSliderEffects[option[43]/*customFx*/];
				}

				if (option[11]/*continuous*/) continuousClones = [];

				for (var a = 0; a < s; a++) {
					option[15]/*numerictext*/[a] = option[15]/*numerictext*/[a] || (a+1);
					option[24]/*ajax*/[a] = option[24]/*ajax*/[a] || FALSE;
				}

				callBackList = [];
				for (var i = 0; i < s; i++) {
					callBackList[i] = [];
					callBackList[i].push(li.eq(i));
				}

				// Clone elements for continuous scrolling
				if(continuousClones) {
				    for (var i = option[39]/*slidecount*/ ; i >= 1 && s > 0 ; i--) {
					    var appendRealPos = getRealPos(-option[39]/*slidecount*/ + i - 1);
						var prependRealPos = getRealPos(option[39]/*slidecount*/-i);
						var appendClone = li.eq(appendRealPos).clone();
						continuousClones.push(appendClone);
						var prependClone = li.eq(prependRealPos).clone();
						continuousClones.push(prependClone);
						callBackList[appendRealPos].push(appendClone);
						callBackList[prependRealPos].push(prependClone);
						ul.prepend(appendClone).append(prependClone);
					}
					// This variable is also defined later, that's for the cases where Ajax is off, i also need to define it now, because the below code needs it.
					liConti = ul.children("li");
				}

				option[2]/*controlsfade*/ = option[2]/*controlsfade*/ && !option[11]/*continuous*/;

				// Making sure that i have enough room in the <ul> (Through testing, i found out that the max supported size (height or width) in Firefox is 17895697px, Chrome supports up to 134217726px, and i didn't find any limits in IE (6/7/8/9)).
				ul[option[6]/*vertical*/ ? 'height' : 'width'](9000000); // That gives room for about 12500 slides of 700px each (and works in every browser i tested). Down to 9000000 from 10000000 because the later might not work perfectly in Firefox on OSX.

				liConti = ul.children("li");

				// If responsive is turned on, autowidth doesn't work.
				option[38]/*autowidth*/ = option[38]/*autowidth*/ && !option[42]/*responsive*/;

				if (option[42]/*responsive*/) {
					$(window).on("resize focus", adjustResponsiveLayout).resize();
				}

				controls = FALSE;
				if(option[0]/*controlsShow*/) {
					// Instead of just generating HTML, i make it a little smarter.
					controls = $('<span ' + option[36]/*controlsattr*/ + '></span>');
					$(obj)[option[3]/*insertafter*/ ? 'after' : 'before'](controls);

					if(option[13]/*numeric*/) {
						numericContainer = controls.prepend('<ol '+ option[14]/*numericattr*/ +'></ol>').children();
						var distanceBetweenPages = option[13]/*numeric*/ == PAGES_MARKER_STRING ? numberOfVisibleSlides : 1;
						for(var a = 0; a < s - ((option[11]/*continuous*/ || option[13]/*numeric*/ == PAGES_MARKER_STRING) ? 1 : numberOfVisibleSlides) + 1; a += distanceBetweenPages) {
							numericControls[a] = $("<li rel='" + (a+1) + "'><a href='#'><span>"+ option[15]/*numerictext*/[a] +"</span></a></li>")
							.appendTo(numericContainer)
							.click(function(){
								goToSlide(getRelAttribute(this) - 1, TRUE);
								return FALSE;
							});
						};
					}
					if(option[4]/*firstshow*/) firstbutton = makecontrol(option[35]/*firsthtml*/, FIRST_STRING);
					if(option[5]/*lastshow*/) lastbutton = makecontrol(option[37]/*lasthtml*/, LAST_STRING);
					if(option[12]/*prevnext*/){
						nextbutton = makecontrol(option[33]/*nexthtml*/, NEXT_STRING);
						prevbutton = makecontrol(option[32]/*prevhtml*/, PREV_STRING);
					}
				};


				// Lets make those fast/normal/fast into some numbers we can make calculations with.
				var optionsToConvert = [1/*controlsfadespeed*/,7/*speed*/,10/*pause*/,18/*speedhistory*/,23/*fadespeed*/];
				for (a in optionsToConvert) {
					option[parseInt10(optionsToConvert[a])] = textSpeedToNumber(option[optionsToConvert[a]]);
				}

				if (option[19]/*customlink*/) {
					$(document).on("click", option[19]/*customlink*/, function() {
						var target;
						if (target = getRelAttribute(this)) {
							if (target == 'stop') {
								option[9]/*auto*/ = FALSE;
								stopAuto();
							}
							else if (target == "start") {
								timeout = startAuto(option[10]/*pause*/);
								option[9]/*auto*/ = TRUE;
							}
							else if (target == 'block') clickable = FALSE;
							else if (target == 'unblock') clickable = TRUE;
							else if (clickable) goToSlide((target == parseInt10(target)) ? target - 1 : target, TRUE);
						}
						return FALSE;
					});
				}


				runOnImagesLoaded(liConti.slice(0,option[39]/*slidecount*/), TRUE, function () {
					if (option[9]/*auto*/) {
					    timeout = startAuto(option[10]/*pause*/);
					}

					if (destroyT) {
					    animate(destroyT,FALSE);
					} else if (option[16]/*history*/) {
						// I support the jquery.address plugin, Ben Alman's hashchange plugin and Ben Alman's jQuery.BBQ.
						var window = $(window); // BYTES!
						var hashPlugin;
						if (hashPlugin = window.hashchange) {
							hashPlugin(URLChange);
						} else if (hashPlugin = $.address) {
							hashPlugin.change(URLChange);
						} else {
						    // This assumes that jQuery BBQ is included. If not, stuff won't work in old browsers.
							window.on("hashchange", URLChange);
						}
						URLChange();
					}
					else animate(option[26]/*startslide*/ - 1,FALSE);
				});

				if (option[25]/*preloadajax*/ === TRUE) {
				    for (var i = 0; i <= ts; i++) {
				        if (option[24]/*ajax*/[i] && option[26]/*startslide*/ - 1 != i) {
				            ajaxLoad(i, FALSE, 0, FALSE);
				        }
				    }
				} else if (option[24]/*ajax*/[0]) {
				    ajaxLoad(0, FALSE, 0, FALSE);
				}
			}
			/*
			 * The functions do the magic.
			 */
			// Adjusts the slider when a change in layout has happened.
			function adjustResponsiveLayout() {
				liConti.width(getResponsiveWidth());
				autoadjust(t, 0);
				adjustPosition();
			}

            // Simply returns the value of the rel attribute for the given element.
			function getRelAttribute(that) {
			    return $(that).attr("rel");
			}

			// Returns the width of a single <li> if the page layout is responsive.
			function getResponsiveWidth() {
				return obj.width() / numberOfVisibleSlides;
			}

			// Triggered when the URL changes.
			function URLChange() {
				var target = filterUrlHash(location.hash.substr(1));
				if (init) animate(target,FALSE);
				else if (target != t) goToSlide(target, FALSE);
			}

			function startAsyncDelayedLoad () {
				if (option[24]/*ajax*/ && parseInt10(option[25]/*preloadajax*/)) {
					for (a in option[24]/*ajax*/) {
						if (option[24][a]) {
							clearTimeout(asyncTimedLoad);
							asyncTimedLoad = setTimeout(function(){
								if (option[24][a]/*ajax*/) {
									ajaxLoad(a, FALSE, 0, FALSE);
								} else {
									startAsyncDelayedLoad();
								}
							}, parseInt10(option[25]/*preloadajax*/));

							break;
						}
					}
				}
			}

			function startAuto(pause) {
				autoOn = TRUE;
				return setTimeout(function(){
					goToSlide(NEXT_STRING, FALSE);
				},pause);
			}

			function stopAuto(autoPossibleStillOn) {
				clearTimeout(timeout);
				if (!autoPossibleStillOn) autoOn = FALSE;
			}

			function textSpeedToNumber(speed) {
				return (parseInt10(speed) || speed == 0) ?
						parseInt10(speed) :
					speed == 'fast' ?
						200 :
					(speed == 'normal' || speed == 'medium') ?
						400 :
					speed == 'slow' ?
						600 :
					400;
			};

			function makecontrol(html, action) {
			    return $(html).prependTo(controls).click(function () {
					goToSlide(action, TRUE);
					return FALSE;
				});
			}

			// <strike>Simple function</strike><b>A litle complecated function after moving the auto-slideshow code and introducing some "smart" animations</b>. great work.
			function goToSlide(i, clicked) {
			    if (clickable) {
                    // Stopping, because if its needed then its restarted after the end of the animation.
                    stopAuto(TRUE);

                    beforeanifuncFired = FALSE;
                    if (!destroyed) {
                        customAni(i, clicked, FALSE);
                    }
                }
			};

			function fadeControl (fadeOpacity,fadetime,nextcontrol) // It may not sound like it, but the variable fadeOpacity is only for TRUE/FALSE.
			{
				if (nextcontrol) {
					var eA = nextbutton,
					eB = lastbutton,
					directionA = NEXT_STRING,
					directionB = LAST_STRING,
					firstlastshow = option[5]/*lastshow*/;
				} else {
					var eA = prevbutton,
					eB = firstbutton,
					directionA = PREV_STRING,
					directionB = FIRST_STRING,
					firstlastshow = option[4]/*firstshow*/;
				}

				if (option[0]/*controlsShow*/) {
				    if (fadeOpacity) {
				        if (option[12]/*prevnext*/) eA.filter(HIDDEN_SELECTOR_STRING).fadeIn(fadetime);
				        if (firstlastshow) eB.filter(HIDDEN_SELECTOR_STRING).fadeIn(fadetime);
				    }
				    else {
				        if (option[12]/*prevnext*/) eA.filter(SELECTED_SELECTOR_STRING).fadeOut(fadetime);
				        if (firstlastshow) eB.filter(SELECTED_SELECTOR_STRING).fadeOut(fadetime);
				    }
				}
				if(option[19]/*customlink*/) {
				    var filterFunction = function () {
				        return (getRelAttribute(this) == directionA || getRelAttribute(this) == directionB);
				    };
				    if (fadeOpacity) {
				        $(option[19]/*customlink*/).filter(filterFunction).filter(HIDDEN_SELECTOR_STRING).fadeIn(fadetime);
				    }
				    else {
				        $(option[19]/*customlink*/).filter(filterFunction).filter(SELECTED_SELECTOR_STRING).fadeOut(fadetime);
				    }
				}
			};

			// Fade the controls, if we are at the end of the slide.
			// It's all the different kind of controls.
			function fadeControls (a,fadetime) {
				fadeControl (a,fadetime,FALSE); // abusing that the number 0 == FALSE.
				// The new way of doing it.
				fadeControl(a < s - numberOfVisibleSlides, fadetime, TRUE);
			};
			// Updating the 'current' class
			function setCurrent(i) {
				i = getRealPos(i) + 1;
				if (option[13]/*numeric*/) for (a in numericControls) setCurrentElement(numericControls[a], i);
				if(option[19]/*customlink*/) setCurrentElement($(option[19]/*customlink*/), i);
			};

			function setCurrentElement(element,i) {
				if (element.filter)
				{
					element
						.filter(".current")
						.removeClass("current")
						.each(function() {
						    var that = this;
						    callAsync(function () {
							    if (isFunc(option[30]/*uncurrentfunc*/)){ option[30]/*uncurrentfunc*/.call(that, getRelAttribute(that)); }
							});
						});

					element
						.filter(function() {
							var elementTarget = getRelAttribute(this);
							if (option[13]/*numeric*/ == PAGES_MARKER_STRING) {
								for (var a = 0; a < numberOfVisibleSlides; a++) {
									if (elementTarget == i - a) return TRUE;
								}
							}
							else return elementTarget == i;
							return FALSE;
						})
						.addClass("current")
						.each(function() {
						    var that = this;
						    callAsync(function () {
							    if (isFunc(option[31]/*currentfunc*/)){ option[31]/*currentfunc*/.call(that, getRelAttribute(that)); }
                            });
						});
					}
			};

			function filterUrlHash(a) {
				for (i in option[15]/*numerictext*/) {
				    if (option[15]/*numerictext*/[i] == a) {
				        return i;
				    }
				}
				return a ? t : 0;
			};

			function runOnImagesLoaded (target, allSlides, callback) {
				var elems = target.add(target.find("img")).filter("img");
				var len = elems.length;
				if (!len) {
					callback();
					// No need to do anything else.
					return this;
				}
				function loadFunction(that) {
					$(that).off('load error');
					//$(that).unbind('load').unbind('error');
					// Webkit/Chrome (not sure) fix.
					if (that.naturalHeight && !that.clientHeight) {
						$(that).height(that.naturalHeight).width(that.naturalWidth);
					}
					if (allSlides) {
						len--;
						if (len == 0) {
							callback();
						}
					}
					else {
						callback();
					}
				}
				elems.each(function(){
					var that = this;
					$(that).on('load error', function () {
						loadFunction(that);
					});
					/*
					 * Start ugly working IE fix.
					 */
					if (that.readyState == "complete") {
						$(that).trigger("load");
					} else if (that.readyState) {
						// Sometimes IE doesn't fire the readystatechange, even though the readystate has been changed to complete. AARRGHH!! I HATE IE, I HATE IT, I HATE IE!
						that.src = that.src; // Do not ask me why this works, ask the IE team!
					}
					/*
					 * End ugly working IE fix.
					 */
					else if (that.complete) {
						$(that).trigger("load");
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

			function autoadjust(i, speed) {
			    i = getRealPos(i); // I assume that the continuous clones, and the original element is the same height. So i always adjust acording to the original element.

			    adjustingTo = i;
                adjustTargetTime = getTimeInMillis() + speed;

				if (speed == 0) {
					finishedAdjustingTo = i;
				} else {
					finishedAdjustingTo = FALSE;
				}

				// Both autoheight and autowidth can be enabled at the same time. It's a kind of magic.
				if (option[18]/*autoheight*/) autoheightwidth(i, TRUE);//autoheight(i, speed);
				if (option[38]/*autowidth*/) autoheightwidth(i, FALSE);//autowidth(i, speed);
			}

			// Axis: TRUE == height, FALSE == width.
			function autoheightwidth(i, axis) {
				obj.ready(function() {
					adjustHeightWidth (i, axis);
					runOnImagesLoaded (li.eq(i), FALSE, function(){
						adjustHeightWidth (i, axis);
					});
				});
			};

			function adjustHeightWidth (i, axis) {
			    if (i != adjustingTo) {
			        return;
			    }
			    var pixels = 0;
                for (var slide = i; slide < i + numberOfVisibleSlides; slide++) {
                    var targetPixels = li.eq(getRealPos(slide))['outer' + (axis ? "Height" : "Width")](TRUE);
                    if (axis == option[6]/*vertical*/) {
                        pixels += targetPixels;
                    } else {
                        pixels = Math.max(targetPixels, pixels);
                    }
                }

				var speed = adjustTargetTime - getTimeInMillis();
				speed = Math.max(speed, 0);
				// First i run it. In case there are no images to be loaded.
				obj.animate(
					axis ? {height : pixels} : {width : pixels},
					{
						queue:FALSE,
						duration:speed,
						easing:option[8]/*ease*/
					}
				);
			}

			function adjustPosition() {
			    setUlMargins(0,0);

			    setUlMargins(
			        getSlidePosition(t, FALSE),
			        getSlidePosition(t, TRUE)
			    )
			};
			function setUlMargins(left, top) {
			    ul.css({
                    marginLeft : left,
                    marginTop : top
                });
			}

			function getSlidePosition(slide, vertical) {
			    var slide = liConti.eq(slide + (continuousClones ? option[39]/*slidecount*/ : 0));
			    var result = slide.length ? - slide.position()[vertical ? "top" : "left"] : 0;
				return result;
			};

			function adjust() {
			    autoadjust(t, 0);
                t = getRealPos(t); // Going to the real slide, away from the clone.
				if(!option[23]/*updateBefore*/) setCurrent(t);
				adjustPosition();
				clickable = TRUE;
				if(option[16]/*history*/ && buttonclicked) window.location.hash = option[15]/*numerictext*/[t];

				if (option[9]/*auto*/) {
				    // Stopping auto if clicked. And also continuing after X seconds of inactivity.
				    if (buttonclicked) {
				        stopAuto();
				        if (option[40]/*resumepause*/) timeout = startAuto(option[40]/*resumepause*/);
				    } else {
				        timeout = startAuto(option[10]/*pause*/);
				    }
				}

				if (beforeanifuncFired) {
				    aniCall(t, TRUE); // I'm not running it at init, if i'm loading the slide.
				}
			};

			// This function is called when i need a callback on the current element and it's continuous clones (if they are there).
			// after:  TRUE == afteranifunc : FALSE == beforeanifunc;
			function aniCall (i, after) {
				i = getRealPos(i);
				var slideElements = getSlideElements(i);
				// Wierd fix to let IE accept the existance of the sudoSlider object.
				callAsync(function () {
					(after ? afterAniCall : beforeAniCall)(slideElements, i + 1);
				});
			}

			function afterAniCall(el, a) {
				if (isFunc(option[29]/*afteranifunc*/)) option[29]/*afteranifunc*/.call(el, a);
			}

			function beforeAniCall(el, a) {
				if (isFunc(option[28]/*beforeanifunc*/)) option[28]/*beforeanifunc*/.call(el, a);
			}

			function getSlideElements(i) {
			    var callBackThis = $();
                for (a in callBackList[i]) {
                    callBackThis = callBackThis.add(callBackList[i][a]);
                }
                return callBackThis;
			}

            // Puts the specified function in a setTimeout([function], 0);
			function callAsync(func) {
                setTimeout(func, 0);
			}

			// Convert the direction into a usefull number.
			function filterDir(dir) {
				if (dir == NEXT_STRING) {
					return limitDir(t + option[41]/*movecount*/, dir);
				} else if (dir == PREV_STRING) {
					return limitDir(t - option[41]/*movecount*/, dir);
				} else if (dir == FIRST_STRING) {
					return 0;
				} else if (dir == LAST_STRING) {
					return ts;
				} else {
					return limitDir(parseInt10(dir), dir);
				}
			};
			// If continuous is off, we sometimes do not want to move to far.
			// This method was added in 2.1.8, se the changelog as to why.
			function limitDir(i, dir) {
				if (option[11]/*continuous*/) {
					return getRealPos(i);
				} else {
					var maxSlide = s - numberOfVisibleSlides;
					if (i > maxSlide) {
						if (t == maxSlide && dir == NEXT_STRING) {
							return 0;
						} else {
							return maxSlide;
						}
					} else if (i < 0) {
						if (t == 0 && dir == PREV_STRING) {
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
			function ajaxLoad(i, adjust, speed, ajaxCallBack) {
				if (asyncTimedLoad) clearTimeout(asyncTimedLoad);// I dont want it to run to often.
				var target = option[24]/*ajax*/[i];
				var targetslide = li.eq(i);
				// parsing the init variable.
				var speed = (speed === TRUE) ? 0 : speed;

				var tt = i + 1;
				var textloaded = FALSE;

				$.ajax({
					url: target,
					success: function(data, textStatus, jqXHR){
					    var completeFunction = function () {
					        var type = jqXHR.getResponseHeader('Content-Type').substr(0,1);
                            if (type != "i") {
                                textloaded = TRUE;
                                targetslide.html(data);
                                ajaxAdjust(i, speed, ajaxCallBack, adjust, FALSE);
                            }
					    }
					    if (currentlyAnimating) {
					        awaitingAjaxLoads.push(completeFunction);
					    } else {
					        completeFunction();
					    }
					},
					complete: function(jqXHR){
						// Some browsers wont load images this way, so i treat an error as an image.
						// There is no stable way of determining if it's a real error or if i tried to load an image in a old browser, so i do it this way.
						if (!textloaded) {
							// Load the image.
							image = new Image();
							targetslide.html('').append(image);
							image.src = target;
							// Lets just make some adjustments
							ajaxAdjust(i, speed, ajaxCallBack, adjust, TRUE);
						}
					}
				});
				// It is loaded, we dont need to do that again.
				option[24]/*ajax*/[i] = FALSE;
				// It is the only option that i need to change for good.
				options.ajax[i] = FALSE;
			};
			function ajaxAdjust(i, speed, ajaxCallBack, adjust, img){
			    var target = li.eq(i);
			    var callbackTarget = target;
				// Now to see if the generated content needs to be inserted anywhere else.
				if (continuousClones) {
					var notFirst = FALSE;
					for (a in callBackList[i]) {
					    if (notFirst) {
					        var newSlide = target.clone();
					        continuousClones.push(newSlide);
					        callBackList[i][a].replaceWith(newSlide);
					        callBackList[i][a] = newSlide;
					        callbackTarget = callbackTarget.add(newSlide);
					    }
						notFirst = TRUE;
					}

					// The liConti gets messed up a bit in the above code, therefore i fix it.
					liConti = ul.children("li");
				}

				if (adjust || finishedAdjustingTo == i) autoadjust(i, speed);

                adjustPosition();

				runOnImagesLoaded (target, TRUE, function(){
					adjustPosition();
					// And the callback.
					if (isFunc(ajaxCallBack)) ajaxCallBack();
					startAsyncDelayedLoad();
				    // If we want, we can launch a function here.
					if (isFunc(option[27]/*ajaxloadfunction*/)) { option[27]/*ajaxloadfunction*/.call(callbackTarget, parseInt10(i) + 1, img); }
				});

				// In some cases, i want to call the beforeanifunc here.
				if (ajaxCallBack == 2) {
					aniCall(i, FALSE);
					if (!beforeanifuncFired) {
						aniCall(i, TRUE);
						beforeanifuncFired = TRUE;
					}
				}

			};

			function customAni(i, clicked, ajaxcallback) {
                if (filterDir(i) != t && !destroyed && clickable) {
                    // Just leave the below code as it is, i've allready spent enough time trying to improve it, it allways ended up in me making nothing that worked like it should.
                    ajaxloading = FALSE;

                    var dir = filterDir(i);

                    if (option[23]/*updateBefore*/) setCurrent(dir);

                    if(option[2]/*controlsfade*/) fadeControls (dir,option[1]/*controlsfadespeed*/);

                    if (ajaxcallback) {
                        speed = oldSpeed;
                        if (dontCountinue) dontCountinue--; // Short for if(dontCountinue == 0).
                    } else if (option[24]/*ajax*/) {
                        // Before i can fade anywhere, i need to load the slides that i'm fading too (needs to be done before the animation, since the animation may include cloning of the target elements.
                        dontCountinue = 0;
                        for (var a = dir; a < dir + numberOfVisibleSlides; a++) {
                            if (option[24]/*ajax*/[a]) {
                                ajaxLoad(getRealPos(a), FALSE, option[7]/*speed*/, function(){
                                    customAni(i, clicked, TRUE);
                                });
                                dontCountinue++;
                            }
                        }
                    } else {
                        dontCountinue = FALSE;
                    }
                    if (!dontCountinue) {
                        clickable = FALSE;
                        var fromSlides = $();
                        var toSlides = $();
                        for (var a = 0 ; a < numberOfVisibleSlides; a++) {
                            if (continuousClones) {
                                fromSlides = fromSlides.add(liConti.eq((t + a) + (continuousClones ? option[39]/*slidecount*/ : 0)));
                                toSlides = toSlides.add(liConti.eq((dir + a) + (continuousClones ? option[39]/*slidecount*/ : 0)));
                            } else {
                                fromSlides = fromSlides.add(getSlideElements(getRealPos(t + a)));
                                toSlides = toSlides.add(getSlideElements(getRealPos(dir + a)));;
                            }
                        }

                        // Finding a "shortcut", used for calculating the offsets.
                        if (option[11]/*continuous*/) {
                            var realTarget = dir;
                            i = realTarget;
                            // Finding the shortest path from where we are to where we are going.
                            var diff = MathAbs(t-realTarget);
                            if (realTarget < option[39]/*slidecount*/-numberOfVisibleSlides+1 && MathAbs(t - realTarget - s)/* t - (realTarget + s) */ < diff) {
                                i = realTarget + s;
                                diff = MathAbs(t - realTarget - s); // Setting the new "standard", for how long the animation can be.
                            }
                            if (realTarget > ts - option[39]/*slidecount*/ && MathAbs(t - realTarget + s)/* t - (realTarget - s) */  < diff) {
                                i = realTarget - s;
                            }
                        } else {
                            i = filterDir(i);
                        }


                        var leftOffset = getSlidePosition(t, FALSE) - getSlidePosition(i, FALSE);
                        var topOffset = getSlidePosition(t, TRUE) - getSlidePosition(i, TRUE);

                        var callObject = {
                            fromSlides : fromSlides,
                            toSlides : toSlides,
                            slider : obj,
                            options: jQuery.extend(TRUE, {}, options), // Making a copy, to enforce read-only.
                            toSlideNumber: dir + 1,
                            fromSlideNumber: t + 1,
                            offset: {
                                left: leftOffset,
                                top: topOffset
                            },
                            callback: function () {
                                currentlyAnimating = FALSE;
                                clickable = TRUE;
                                animate(dir,clicked);
                                if(option[16]/*history*/ && clicked) {
                                    window.location.hash = option[15]/*numerictext*/[t];
                                }
                                // afterAniFunc
                                aniCall(dir, TRUE);

                                while (awaitingAjaxLoads.length) {
                                    awaitingAjaxLoads.pop()();
                                }
                            }
                        }
                        currentlyAnimating = TRUE;

                        var extraClone = option[43]/*customFx*/.call(baseSlider, callObject);

                        if (extraClone) {
                            callBackList[dir].push(extraClone);
                        }

                        // beforeAniFunc
                        aniCall(dir, FALSE);

                        autoadjust(dir, option[7]/*speed*/);

                        if (extraClone) {
                            callBackList[dir].pop();
                        }
                    }
                }
            };

			function animate(dir, clicked) {
				if ((clickable && !destroyed && (dir != t || init))) {
					clickable = !clicked && !option[9]/*auto*/;
					// to the adjust function.
					buttonclicked = clicked;
					ot = t;
					t = dir;

                    ul.animate(
                        { marginTop: getSlidePosition(t, TRUE), marginLeft: getSlidePosition(t, FALSE)},
                        {
                            queue:FALSE,
                            duration:0,
                            complete: adjust
                        }
                    );

                    if(option[2]/*controlsfade*/) {
                        var fadetime = option[1]/*controlsfadespeed*/;
                        if (!clicked && !option[9]/*auto*/) fadetime = (option[17]/*speedhistory*/ / option[7]/*speed*/) * option[1]/*controlsfadespeed*/;
                        fadeControls (t,fadetime);
                    }

                    init = FALSE;

                };
			};

			function getRealPos(a) {
				// Fixes an infinite loop if there are 0 slides in the slider.
				if (s == 0) {
					return 0;
				}
				var position = parseInt10(a);
				while (position < 0) {
					position += s;
				}
				return position % s;
			}

			function fixClearType (element) {
                if (screen.fontSmoothingEnabled) element.style.removeAttribute("filter"); // Fix cleartype
            }

		    /*
 			 * Public methods.
			 */

			// First i just define those i use more than one (with a "public" prefix). Then i just add the others as anonymous functions.
			function publicDestroy() {
			    destroyed = TRUE;
				destroyT = t;

				if (option[42]/*responsive*/) {
					$(window).off("resize focus", adjustResponsiveLayout);
				}

				if (controls) {
				    controls.remove();
				}

				$(option[19]/*customlink*/).off("click");

				if (continuousClones) {
				    for (var i = 0; i < continuousClones.length; i++) {
				        continuousClones[i].remove();
				    }
				}

				adjustPosition();
			}

			addMethod("destroy", publicDestroy);

			function publicInit(){
				if (destroyed) {
					initSudoSlider(obj, destroyT);
				}
			}

			addMethod("init", publicInit);

			addMethod("getOption", function(a){
				return options[a.toLowerCase()];
			});

			addMethod("setOption", function(a, val){
				publicDestroy();
				options[a.toLowerCase()] = val;
				publicInit();
			});

			addMethod("insertSlide", function (html, pos, numtext, goToSlide) {
				publicDestroy();
				// pos = 0 means before everything else.
				// pos = 1 means after the first slide.
				if (pos > s) pos = s;
				var html = '<li>' + html + '</li>';
				if (!pos || pos == 0) ul.prepend(html);
				else li.eq(pos -1).after(html);
				// Finally, we make it work again.
				if (goToSlide) {
				    destroyT = goToSlide - 1;
				} else if (pos <= destroyT || (!pos || pos == 0)) {
				    destroyT++;
				}

				if (option[15]/*numerictext*/.length < pos){
				    option[15]/*numerictext*/.length = pos;
				}

				option[15]/*numerictext*/.splice(pos,0,numtext || parseInt10(pos)+1);
				publicInit();
			});

			addMethod("removeSlide", function(pos){
				pos--; // 1 == the first.
				publicDestroy();

				li.eq(pos).remove();
				option[15]/*numerictext*/.splice(pos,1);
				if (pos < destroyT){
				    destroyT--;
				}

				publicInit();
			});

			addMethod("goToSlide", function(a){
				goToSlide((a == parseInt10(a)) ? a - 1 : a, TRUE);
			});

			addMethod("block", function(){
				clickable = FALSE;
			});

			addMethod("unblock", function(){
				clickable = TRUE;
			});

			addMethod("startAuto", function(){
				option[9]/*auto*/ = TRUE;
				timeout = startAuto(option[10]/*pause*/);
			});

			addMethod("stopAuto", function(){
				option[9]/*auto*/ = FALSE;
				stopAuto();
			});

			addMethod("adjust", function(){
				autoadjust(t, 0)
				adjustPosition();
			});

			addMethod("getValue", function(a){
				return a == 'currentSlide' ?
						t + 1 :
					a == 'totalSlides' ?
						s :
					a == 'clickable' ?
						clickable :
					a == 'destroyed' ?
						destroyed :
					a == 'autoAnimation' ?
						autoOn :
					undefined;
			});

			addMethod("getSlide", function (number) {
			    number = getRealPos(parseInt10(number) - 1);
			    return getSlideElements(number);
			});

		});
	};
	/*
	 * End generic slider. Start animations.
	 */

    // Start by defining everything, the implementations is below.
	var richEffects = {
	    pushUp : pushUp,
        pushRight : pushRight,
        pushDown : pushDown,
        pushLeft : pushLeft,
        slide : slide,
        fadeInOut : fadeInOut,
        crossFade : crossFade,
        show : show
	}

	var imageEffects = {
	    fold : fold,
        foldReverse : foldReverse,
        foldRandom : foldRandom,
        boxes : boxes,
        boxesGrow : boxesGrow,
        boxesReverse : boxesReverse,
        boxesGrowReverse : boxesGrowReverse,
        boxRain : boxRain,
        boxRainGrow : boxRainGrow,
        boxRainReverse: boxRainReverse,
        boxRainGrowReverse : boxRainGrowReverse,
        boxRandom : boxRandom,
        boxRandomGrow : boxRandomGrow,
        sliceUp : sliceUp,
        sliceUpLeft : sliceUpLeft,
        sliceDown : sliceDown,
        sliceDownLeft : sliceDownLeft,
        sliceUpDown : sliceUpDown,
        sliceUpDownLeft : sliceUpDownLeft,
        barsUp : barsUp,
        barsDown : barsDown,
        boxesDown : boxesDown,
        boxesDownGrow : boxesDownGrow,
        boxesUp : boxesUp,
        boxesUpGrow : boxesUpGrow
	}

	var allEffects = mergeObjects(richEffects, imageEffects);

	var randomEffects = {
	    random: function (obj) {
	        var effectFunction = pickRandomValue(allEffects);
            return effectFunction(obj);
	    },
	    randomImage: function (obj) {
	        var effectFunction = pickRandomValue(imageEffects);
            return effectFunction(obj);
	    },
	    randomRich: function (obj) {
	        var effectFunction = pickRandomValue(richEffects);
            return effectFunction(obj);
	    }
	}
    // Saving it
	$.fn.sudoSlider.effects = mergeObjects(allEffects, randomEffects);

    // The implementations
    function sliceUp(obj) {
        sliceUpDownTemplate(obj, 1, FALSE);
    }
    function sliceUpLeft(obj) {
        sliceUpDownTemplate(obj, 1, TRUE);
    }
    function sliceDown(obj) {
        sliceUpDownTemplate(obj, 2, FALSE);
    }
    function sliceDownLeft(obj) {
        sliceUpDownTemplate(obj, 2, TRUE);
    }
    function sliceUpDown(obj) {
        sliceUpDownTemplate(obj, 3, FALSE);
    }
    function sliceUpDownLeft(obj) {
        sliceUpDownTemplate(obj, 3, TRUE);
    }

    function barsUp(obj) {
        sliceUpDownTemplate(obj, 2, FALSE, TRUE);
    }
    function barsDown(obj) {
        sliceUpDownTemplate(obj, 1, FALSE, TRUE);
    }

    function sliceUpDownTemplate(obj, dir, reverse, randomize) { // Dir: 1 == down, 2 == up, 3 == up/down.
        var numberOfSlices = obj.options.slices;
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
            var bottom = TRUE;
            if (dir == 3) {
                if (i == 0) {
                    bottom = FALSE;
                    i++;
                } else {
                    i = 0;
                }
            } else if (dir == 2) {
                bottom = FALSE;
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
            }, timeBuff);
            timeBuff += (speed / numberOfSlices);
            v++;
        });
    }
    function boxes(obj) {
        boxTemplate(obj, FALSE, FALSE);
    }
    function boxesGrow(obj) {
        boxTemplate(obj, FALSE, TRUE);
    }
    function boxesReverse(obj) {
        boxTemplate(obj, FALSE, FALSE, TRUE);
    }
    function boxesGrowReverse(obj) {
        boxTemplate(obj, FALSE, TRUE, TRUE);
    }

    function boxRandom(obj) {
        boxTemplate(obj, TRUE, FALSE);
    }

    function boxRandomGrow(obj) {
        boxTemplate(obj, TRUE, TRUE);
    }

    function boxTemplate(obj, random, grow, reverse) {
        var speed = obj.options.speed;
        var boxRows = obj.options.boxrows;
        var boxCols = obj.options.boxcols;
        var target = $(obj.toSlides.get(0));
        var boxes = createBoxes(target, obj.slider, boxCols, boxRows);
        var totalBoxes = boxes.length;
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
            }, timeBuff);
            timeBuff += (speed / totalBoxes);
            i++;
        });
    }

    function boxesDown(obj) {
        boxRainTemplate(obj, FALSE, FALSE, TRUE);
    }
    function boxesDownGrow(obj) {
        boxRainTemplate(obj, TRUE, FALSE, TRUE);
    }
    function boxesUp(obj) {
        boxRainTemplate(obj, FALSE, TRUE, TRUE);
    }
    function boxesUpGrow(obj) {
        boxRainTemplate(obj, TRUE, TRUE, TRUE);
    }

    function boxRain(obj) {
        boxRainTemplate(obj, FALSE, FALSE);
    }
    function boxRainGrow(obj) {
        boxRainTemplate(obj, TRUE, FALSE);
    }
    function boxRainReverse(obj) {
        boxRainTemplate(obj, FALSE, TRUE);
    }
    function boxRainGrowReverse(obj) {
        boxRainTemplate(obj, TRUE, TRUE);
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
                        }, time);
                    })(rows, prevCol, timeBuff, i, totalBoxes);
                    i++;
                }
                prevCol--;
            }
            timeBuff += (speed / boxCols);
        }
    }

    function fold(obj) {
        foldTemplate(obj, FALSE);
    }

    function foldReverse(obj) {
        foldTemplate(obj, TRUE);
    }

    function foldRandom(obj) {
        foldTemplate(obj, FALSE, TRUE);
    }

    function foldTemplate(obj, reverse, randomize) {
        var slides = obj.options.slices;
        var speed = obj.options.speed;
        var target = $(obj.toSlides.get(0));
        var slicesElement = createSlices(target, obj.slider, slides);
        var count = 0;
        if (reverse) slicesElement = slicesElement._reverse();
        if (randomize) slicesElement = shuffle(slicesElement);
        slicesElement.each(function (i) {
            var timeBuff = 100 + ((speed / slides) * i);
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
                    opacity: 1
                }, speed, '', function () {
                    count--;
                    if (count == 0) {
                        slicesElement.remove();
                        obj.callback();
                    }
                });
            }, timeBuff);
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
            var extraPush = that['outer' + (vertical ? "Height" : "Width")](TRUE);
            that.css({'z-index' : 10000, 'position' : 'absolute', 'list-style' : 'none', "top" : vertical ? push : 0, "left" : vertical ? 0 : push});
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
            push += that['outer' + (vertical ? "Height" : "Width")](TRUE);
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
                queue:FALSE,
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
                queue: FALSE,
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
            push += that['outer' + (vertical ? "Height" : "Width")](TRUE);
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
                'z-index': 10000,
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
                    'z-index': 10000,
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

	/*
     * Util scripts.
     */
    $.fn._reverse = [].reverse;

    function shuffle(arr) {
        for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x){}
        return arr;
    }

    function isFunc(func) {
        return $.isFunction(func);
    }

    function parseInt10(num) {
        return parseInt(num, 10);
    }

    function getTimeInMillis() {
        return new Date() - 0;
    }

    function MathAbs(number) {
        return number < 0 ? - number : number;
    }

    function mergeObjects(obj1, obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }

    function pickRandomValue(obj) {
        var keys = Object.keys(obj)
        return obj[keys[Math.floor(keys.length * Math.random())]];
    }

})(jQuery);
// If you did just read the entire code, congrats.
// Did you find a bug? I didn't, so plz tell me if you did. (https://github.com/webbiesdk/SudoSlider/issues)