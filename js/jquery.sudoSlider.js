/*
 *  Sudo Slider ver 2.2.8 - jQuery plugin
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
	$.fn.sudoSlider = function(optionsOrg) {
		// Saves space in the minified version.
		// It might look complicated, but it isn't. It's easy to make using "replace all" and it saves a bit in the minified version (only .1KB after i started using Closure Compiler).
		var undefined; // Makes sure that undefined really is undefined within this scope.
		var FALSE = !1;
		var TRUE = !0;
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
			loadingtext:       'Loading Content...', /* option[34]/*loadingtext*/
			firsthtml:         '<a href="#" class="firstBtn"> first </a>', /* option[35]/*firsthtml*/
			controlsattr:      'id="controls"', /* option[36]/*controlsattr*/
			lasthtml:          '<a href="#" class="lastBtn"> last </a>', /* option[37]/*lasthtml*/
			autowidth:         TRUE, /*  option[38]/*autowidth*/
			slidecount:        1, /*  option[39]/*slidecount*/
			resumepause:       FALSE, /* option[40]/*resumepause*/
			movecount:         1, /* option[41]/*movecount*/
			responsive:        FALSE  /* option[42]/*responsive*/
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
			fading,
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
			dontCountinueFade,
			autoOn,
			continuousClones,
			numberOfVisibleSlides,
			beforeanifuncFired = FALSE,
			asyncTimedLoad,
			callBackList,
			obj = $(this),
			finishedAdjustingTo = FALSE, // This variable teels if the slider is currently adjusted (height and width) to any specific slide. This is usefull when ajax-loading stuff.
            adjustingTo, // This one tells what slide we are adjusting to, to make sure that we do not adjust to something we shouldn't.
            adjustTargetTime = 0, // This one holds the time that the autoadjust animation should complete.

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
				fading = FALSE;
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
				// If fade is on, i do not need extra clones.
				if (!option[20]/*fade*/) option[39]/*slidecount*/ += option[41]/*movecount*/ - 1;

				// startslide can only be a number (and not 0).
				option[26]/*startslide*/ = parseInt10(option[26]/*startslide*/) || 1;

				// If using fade, continuous clones are only needed if more than one slide is shown at the time.
				continuousClones = option[11]/*continuous*/ && (!option[20]/*fade*/ || option[39]/*slidecount*/ > 1);
				if (continuousClones) continuousClones = [];

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
					    animate(destroyT,FALSE,FALSE,FALSE);
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
					else animate(option[26]/*startslide*/ - 1,FALSE,FALSE,FALSE);
				});

				if (option[25]/*preloadajax*/ === TRUE) {
				    for (var i = 0; i <= ts; i++) {
				        if (option[24]/*ajax*/[i] && option[26]/*startslide*/ - 1 != i) {
				            ajaxLoad(i, FALSE, 0, FALSE);
				        }
				    }
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
				if (init) animate(target,FALSE,FALSE,FALSE);
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
			function goToSlide(i, clicked, speed) {
			    if (clickable) {
                    // Stopping, because if its needed then its restarted after the end of the animation.
                    stopAuto(true);

                    beforeanifuncFired = FALSE;
                    if (!destroyed) {
                        if (option[20]/*fade*/) {
                            fadeto(i, clicked, FALSE);
                        } else {
                            if (option[11]/*continuous*/) {
                                var realTarget = filterDir(i);
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
                            // And now the animation itself.
                            animate(i,clicked,TRUE,FALSE, speed);
                        }
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
                    var targetPixels = li.eq(getRealPos(slide))[axis ? "height" : "width"]();
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
                t = getRealPos(t); // Going to the real slide, away from the clone.
				if(!option[23]/*updateBefore*/) setCurrent(t);
				adjustPosition();
				clickable = TRUE;
				if(option[16]/*history*/ && buttonclicked) window.location.hash = option[15]/*numerictext*/[t];

				if (option[9]/*auto*/) {
				    // Stopping auto if clicked. And also continuing after X seconds of inactivity.
				    if (buttonclicked) {
				        stopAuto();
				        if (option[40]/*resumepause*/) timeout = startAuto( option[40]/*resumepause*/);
				    } else {
				        timeout = startAuto(option[10]/*pause*/);
				    }
				}

				if (!fading && beforeanifuncFired) {
				    AniCall(t, TRUE); // I'm not running it at init, if i'm loading the slide.
				}
			};

			// This function is called when i need a callback on the current element and it's continuous clones (if they are there).
			// after:  TRUE == afteranifunc : FALSE == beforeanifunc;
			function AniCall (i, after) {
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
				var ajaxInit = speed === TRUE;
				var speed = (speed === TRUE) ? 0 : speed;

				var ajaxspeed = (fading) ? (!option[21]/*crossfade*/ ? parseInt10(option[22]/*fadespeed*/ * (2/5)) : option[22]/*fadespeed*/) : speed;
				var tt = i + 1;
				var textloaded = FALSE;

				$.ajax({
					url: target,
					success: function(data, textStatus, jqXHR){
						var type = jqXHR.getResponseHeader('Content-Type').substr(0,1);
						if (type != "i") {
							textloaded = TRUE;
							targetslide.html(data);
							ajaxAdjust(i, speed, ajaxCallBack, adjust, ajaxInit, FALSE);
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
							ajaxAdjust(i, speed, ajaxCallBack, adjust, ajaxInit, TRUE);
						}
					}
				});
				// It is loaded, we dont need to do that again.
				option[24]/*ajax*/[i] = FALSE;
				// It is the only option that i need to change for good.
				options.ajax[i] = FALSE;
			};
			function ajaxAdjust(i, speed, ajaxCallBack, adjust, ajaxInit, img){
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

				runOnImagesLoaded (target, TRUE, function(){
					if (ajaxInit === TRUE) adjustPosition();// Doing this little trick after the images are done.
					// And the callback.
					if (isFunc(ajaxCallBack)) ajaxCallBack();
					startAsyncDelayedLoad();
				    // If we want, we can launch a function here.
					if (isFunc(option[27]/*ajaxloadfunction*/)) { option[27]/*ajaxloadfunction*/.call(callbackTarget, parseInt10(i) + 1, img); }
				});

				// In some cases, i want to call the beforeanifunc here.
				if (ajaxCallBack == 2) {
					AniCall(i, FALSE);
					if (!beforeanifuncFired) {
						AniCall(i, TRUE);
						beforeanifuncFired = TRUE;
					}
				}

			};


			function fadeto(i, clicked, ajaxcallback) {
				if (filterDir(i) != t && !destroyed && clickable) {
					// Just leave the below code as it is, i've allready spent enough time trying to improve it, it allways ended up in me making nothing that worked like it should.
					ajaxloading = FALSE;
					if (option[23]/*updateBefore*/) setCurrent(filterDir(i));
					if (!(speed || speed == 0)) {
					    var speed = (!clicked && !option[9]/*auto*/ && option[16]/*history*/) ? option[22]/*fadespeed*/ * (option[17]/*speedhistory*/ / option[7]/*speed*/) : option[22]/*fadespeed*/;
					}
					// I don't want to fade to a continuous clone, i go directly to the target.
					var ll = filterDir(i);

					if(option[2]/*controlsfade*/) fadeControls (ll,option[1]/*controlsfadespeed*/);

					if (ajaxcallback) {
						speed = oldSpeed;
						if (dontCountinueFade) dontCountinueFade--; // Short for if(dontContinueFade == 0).
					} else if (option[24]/*ajax*/) {
						// Before i can fade anywhere, i need to load the slides that i'm fading too (needs to be done before the animation, since the animation includes cloning of the target elements.
						dontCountinueFade = 0;
						oldSpeed = speed;
						for (var a = ll; a < ll + numberOfVisibleSlides; a++) {
							if (option[24]/*ajax*/[a]) {
								ajaxLoad(getRealPos(a), FALSE, speed, function(){
									fadeto(i, clicked, TRUE);
								});
								dontCountinueFade++;
							}
						}
					} else {
						dontCountinueFade = FALSE;
					}
					if (!dontCountinueFade) {
						clickable = !clicked;
						autoadjust(ll,option[22]/*fadespeed*/);

						if (option[21]/*crossfade*/) {
							var firstRun = TRUE;
							var push = 0;

							for (var a = ll; a < ll + numberOfVisibleSlides; a++) {
								// I clone the target, and fade it in, then hide the cloned element while adjusting the slider to show the real target.
								var clone = li.eq(getRealPos(a)).clone().prependTo(obj);
								clone.css({'z-index' : '10000', 'position' : 'absolute', 'list-style' : 'none', "top" : option[6]/*vertical*/ ? push : 0, "left" : option[6]/*vertical*/ ? 0 : push}).
								hide().fadeIn(option[22]/*fadespeed*/, option[8]/*ease*/, function() {

								    // Removing it from the callbacklist.
								    callBackList[ll].pop();

									fixClearType(this);

									clickable = TRUE;
									fading = TRUE;
									if (firstRun) {
										animate(ll,clicked,FALSE,FALSE);
										if(option[16]/*history*/ && clicked) {
										    window.location.hash = option[15]/*numerictext*/[t];
										}

										AniCall(ll, TRUE);
										firstRun = FALSE;
									}

									$(this).remove();

									fading = FALSE;
								});

								// Adding it to the callbacklist while it exists.
                                callBackList[ll].push(clone);

								push += clone[option[6]/*vertical*/ ? 'outerHeight' : 'outerWidth'](TRUE);
							}

							// Now that everything has been set up, i can call the callback.
							AniCall(ll, FALSE);
						} else {
						    // Executing callback right away. Nothing to set up.
						    AniCall(ll, FALSE);

							// fadeOut and fadeIn.
							var fadeinspeed = parseInt10((speed)*(3/5));
							var fadeoutspeed = speed - fadeinspeed;
							liConti.each(function () {
								$(this).animate(
									{ opacity: 0.0001 },
									{
										queue:FALSE,
										duration:fadeoutspeed,
										easing:option[8]/*ease*/,
										complete:function () {
											// So the animation function knows what to do.
											clickable = TRUE;
											fading = TRUE;
											animate(ll,FALSE,FALSE,FALSE);

											clickable = !clicked;

											$(this).animate(
												{ opacity: 1 },
												{
													queue:FALSE,
													duration:fadeinspeed,
													easing:option[8]/*ease*/,
													complete:function () {
														fixClearType(this);
														if(option[16]/*history*/ && clicked) window.location.hash = option[15]/*numerictext*/[t];
														clickable = TRUE;
														fading = FALSE;
														// Now run that after animation function.
														AniCall(ll, TRUE);
													}
												}
											);
										}
									}
								);
							});
						}
					}
				}
			};

			// (Direction, did the user click something, is this to be done in >1ms?, is this inside a ajaxCallBack?)
			function animate(dir, clicked, time, ajaxcallback, speed) {
				if ((clickable && !destroyed && (dir != t || init)) && s >  getRealPos(dir) || ajaxcallback) {
					if (!ajaxcallback) ajaxloading = FALSE;
					clickable = !clicked && !option[9]/*auto*/;
					// to the adjust function.
					buttonclicked = clicked;
					ot = t;
					t = dir;
					if (option[23]/*updateBefore*/ && !fading) setCurrent(t);

					var diff = Math.sqrt(MathAbs(ot-t));
					if (!(speed || speed == 0)) {
						var speed = (!time) ? 0 : ((!clicked && !option[9]/*auto*/) ? parseInt10(diff*option[17]/*speedhistory*/) : parseInt10(diff*option[7]/*speed*/));
					}

					// Ajax begins here
					var i = getRealPos(t);
					if (ajaxcallback) {
						speed = oldSpeed;
						// Do a check if it can continue.
						if (dontCountinue) dontCountinue--;
					} else if (option[24]/*ajax*/) {
						// Loading the target slide, if not already loaded.
						if (option[24]/*ajax*/[i]) {
							ajaxLoad(i, TRUE, init || speed, 2); // 2 for AniCall
							ajaxloading = TRUE;
						}
						// The slider need to have all slides that are scrolled over loaded, before it can do the animation.
						// That's not easy, because the slider is only loaded once a callback is fired.
						if (!fading) {
							var aa = (ot>t) ? t : ot;
							var ab = (ot>t) ? ot : t;
							dontCountinue = 0;
							oldSpeed = speed;
							for (var a = aa; a <= ab; a++) {
								if (a<=ts && a>=0 && option[24]/*ajax*/[a]) {
									ajaxLoad(a, FALSE, speed, function(){
										animate(dir,clicked,time, TRUE);
									});
									dontCountinue++;
								}
							}
						}
						// Then we have to preload the next ones.
						for (var a = i+1; a <= i + numberOfVisibleSlides; a++) {
							if (option[24]/*ajax*/[a]) {
							    ajaxLoad(a, FALSE, 0, FALSE);
							}
						}
					}
					if (!dontCountinue) {
						if (!fading && !ajaxloading) {
							// Lets run the beforeAniCall
							AniCall(i, FALSE);
							beforeanifuncFired = TRUE;
						}

						if (!fading) {
						    autoadjust(t, speed);
						}

						ul.animate(
							{ marginTop: getSlidePosition(t, TRUE), marginLeft: getSlidePosition(t, FALSE)},
							{
								queue:FALSE,
								duration:speed,
								easing: option[8]/*ease*/,
								complete: adjust
							}
						);

						if(option[2]/*controlsfade*/) {
							var fadetime = option[1]/*controlsfadespeed*/;
							if (!clicked && !option[9]/*auto*/) fadetime = (option[17]/*speedhistory*/ / option[7]/*speed*/) * option[1]/*controlsfadespeed*/;
							if (!time) fadetime = 0;
							if (fading) fadetime = parseInt10((option[22]/*fadespeed*/)*(3/5));
							fadeControls (t,fadetime);
						}

						if (init && !option[24]/*ajax*/[i]) {
						    startAsyncDelayedLoad();
						}

						init = FALSE;

					};
				}
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

			function isFunc(func) {
				return $.isFunction(func);
			}

			function parseInt10(num) {
				return parseInt(num, 10);
			}

			function fixClearType (element) {
				if (screen.fontSmoothingEnabled) element.style.removeAttribute("filter"); // Fix cleartype
			}

			function getTimeInMillis() {
			    return new Date() - 0;
			}

			function MathAbs(number) {
			    return number < 0 ? - number : number;
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

			addMethod("goToSlide", function(a, speed){
				goToSlide((a == parseInt10(a)) ? a - 1 : a, TRUE, speed);
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
})(jQuery);
// If you did just read the entire code, congrats.
// Did you find a bug? I didn't, so plz tell me if you did. (http://webbies.dk/SudoSlider/help/ask-me.html)