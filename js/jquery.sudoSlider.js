/*
 *  Sudo Slider ver 2.2.7 - jQuery plugin 
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
(function($)
{
	$.fn.sudoSlider = function(optionsOrg)
	{
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
		// This is needed if i want to have public functions (And i want public functions).
		var baseSlider = this;
		// This object holds all the callback functions, each field in the object is an array of functions. 
		var callbackFunctions = {};
		// This is where the public functions are, or, this is where they are executed, they are defined in the bottom of the script. 
		function addMethod(name, func)
		{
			// 2 cases, either there is already an callback defined, or there's not. 
			if (callbackFunctions[name])
			{
				// There's already an callback, then we just push the new one. 
				callbackFunctions[name].push(func);
			}
			else
			{
				// No function, lets first make an array in the callbackFunctions object. 
				callbackFunctions[name] = [func];
				// Then the function that is actually called. 
				baseSlider[name] = function () 
				{
					var functions = callbackFunctions[name];
					var returnvar;
					var numberofreturns = 0;
					for (var i = 0; i < functions.length; i++)
					{
						// Arguments is already defined, they are the arguments this method was called with. 
						var tmpReturn = functions[i].apply(this, arguments);
						if (tmpReturn != undefined)
						{
							numberofreturns++;
							if (numberofreturns == 1)
							{
								returnvar = tmpReturn;
							}
							else if (numberofreturns == 2)
							{
								returnvar = [returnvar, tmpReturn];
							}
							else
							{
								returnvar.push(tmpReturn);
							}
						}
					}
					if (numberofreturns == 0)
					{
						return baseSlider;
					}
					return returnvar;
				};
			}
		}
		
		
		// Before merging the defaults and the specified options, i make it all lowercase. 
		function objectToLowercase (obj)
		{
			var ret = {};
			for (var key in obj)
				ret[key.toLowerCase()] = obj[key];
			return ret;
		};
		optionsOrg = $.extend(defaults, objectToLowercase(optionsOrg));
		return this.each(function()
		{
			/*
			 * Lets start this baby. 
			 */
			// First we declare a lot of variables. 
			// Some of the names may be long, but they get minified. 
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
			controls,
			html,
			firstbutton,
			lastbutton,
			nextbutton,
			prevbutton,
			timeout,
			destroyT,
			oldSpeed,
			dontCountinue,
			dontCountinueFade,
			autoOn,
			a,
			b,
			i,
			continuousClones,
			orgslidecount,
			beforeanifuncFired = FALSE,
			asyncTimedLoad,
			callBackList,
			obj = $(this),
			adjustedTo = FALSE, // This variable teels if the slider is currently adjusted (height and width) to any specific slide. This is usefull when ajax-loading stuff. 
			// Making sure that changes in options stay where they belong, very local. 
			options = optionsOrg,
			option = [];
			initSudoSlider(obj, FALSE);
			function initSudoSlider(obj, destroyT)
			{
				// First i rename the options (thereby saving space in the minified version). 
				// This also allows me to change the values of the options, without having to think about what happens if the user re initializes the slider. 
				b = 0;
				for (a in options) {
					option[b] = options[a];
					b++;
				}
				destroyed = FALSE; // In case this isn't the first init. 
				// There are some things we don't do (and some things we do) at init. 
				init = TRUE; // I know it's an ugly workaround, but it works. 
				
				// Fix for nested list items
				ul = obj.children("ul");
				// Is the ul element there?
				if (ul.length == 0) obj.append(ul = $('<ul></ul>'));// No it's not, lets create it. 
				
				li = ul.children("li");
				// Some variables i'm gonna use alot. 
				s = li.length;
				
				// Now we are going to fix the document, if it's 'broken'. (No <ul> or no <li>). 
				// I assume that it's can only be broken, if ajax is enabled. If it's broken without Ajax being enabled, the script doesn't have anything to fill the holes. 
				if (option[24]/*ajax*/)
				{
					// Do we have enough list elements to fill out all the ajax documents. 
					if (option[24]/*ajax*/.length > s)
					{
						// No we dont. 
						for (a = 1; a <= option[24]/*ajax*/.length - s; a++) ul.append('<li><p>' +  option[34]/*loadingtext*/ + '</p></li>');
						li = ul.children("li");
						s = li.length;
					}
				}				
				// Continuing with the variables. 
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
				li.css({'float': 'left', 'display': 'block'});
				
				// I use slidecount very early, so i have to make sure that it's a number.
				option[39]/*slidecount*/ = parseInt10(option[39]/*slidecount*/)
				
				// I use movecount starting with 0 (meaning that i move 1 slide at the time) i convert it here, because it makes no sense to non-coding folks. 
				option[41]--/*movecount*/;
				// Lets just redefine slidecount
				orgslidecount = option[39]/*slidecount*/;
				// If fade is on, i do not need extra clones. 
				if (!option[20]/*fade*/) option[39]/*slidecount*/ += option[41]/*movecount*/;

				// startslide can only be a number (and not 0). 
				option[26]/*startslide*/ = parseInt10(option[26]/*startslide*/) || 1;
				
				// Am i going to make continuous clones?
				// If using fade, continuous clones are only needed if more than one slide is shown at the time. 
				continuousClones = option[11]/*continuous*/ && (!option[20]/*fade*/ || option[39]/*slidecount*/ > 1);
				if (continuousClones) continuousClones = [];
				// Okay, now we have a lot of the variables in place, now we can check for some special conditions. 
				
				// The user doens't always put a text in the numerictext. 
				// With this, if the user dont, the code will. 
				for(a=0;a<s;a++)
				{
					option[15]/*numerictext*/[a] = option[15]/*numerictext*/[a] || (a+1);
					// Same thing for ajax. 
					option[24]/*ajax*/[a] = option[24]/*ajax*/[a] || FALSE;
				}
				callBackList = [];
				for (i = 0; i < s; i++)
				{
					callBackList[i] = [];
					callBackList[i].push(li.eq(i));
				}
				
				// Clone elements for continuous scrolling
				if(continuousClones)
				{
				    for (i = option[39]/*slidecount*/ ; i >= 1 && s > 0 ; i--)
					{
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
				// I don't fade the controls if continuous is enabled. 
				option[2]/*controlsfade*/ = option[2]/*controlsfade*/ && !option[11]/*continuous*/;
				
				// Now that the slide content is in place, some adjustments can be made. 
				// First i make sure that i have enough room in the <ul> (Through testing, i found out that the max supported size (height or width) in Firefox is 17895697px, Chrome supports up to 134217726px, and i didn't find any limits in IE (6/7/8/9)). 
				ul[option[6]/*vertical*/ ? 'height' : 'width'](9000000); // That gives room for about 12500 slides of 700px each (and works in every browser i tested). Down to 9000000 from 10000000 because the later might not work perfectly in Firefox on OSX. 
				
				// And i can make this variable for later use. 
				// The variable contains every <li> element. 
				liConti = ul.children("li");
				
				// If responsive is turned on, autowidth doesn't work. 
				option[38]/*autowidth*/ = option[38]/*autowidth*/ && !option[42]/*responsive*/;
				// 
				if (option[42]/*responsive*/)
				{
					// Making the binding, and triggering it afterwards. 
					$(window).on("resize focus", adjustResponsiveLayout).resize();
				}
				
				// Display the controls.
				controls = FALSE;
				if(option[0]/*controlsShow*/)
				{
					// Instead of just generating HTML, i make it a little smarter. 
					controls = $('<span ' + option[36]/*controlsattr*/ + '></span>');
					$(obj)[option[3]/*insertafter*/ ? 'after' : 'before'](controls);
					
					if(option[13]/*numeric*/) {
						numericContainer = controls.prepend('<ol '+ option[14]/*numericattr*/ +'></ol>').children();
						b = option[13]/*numeric*/ == 'pages' ? orgslidecount : 1;
						for(a=0;a<s-((option[11]/*continuous*/ || option[13]/*numeric*/ == 'pages') ? 1 : orgslidecount)+1;a += b)
						{
							numericControls[a] = $("<li rel='" + (a+1) + "'><a href='#'><span>"+ option[15]/*numerictext*/[a] +"</span></a></li>")
							.appendTo(numericContainer)
							.click(function(){
								goToSlide($(this).attr('rel') - 1, TRUE);
								return FALSE;
							});
						};
					}
					if(option[4]/*firstshow*/) firstbutton = makecontrol(option[35]/*firsthtml*/, "first");
					if(option[5]/*lastshow*/) lastbutton = makecontrol(option[37]/*lasthtml*/, "last");
					if(option[12]/*prevnext*/){
						nextbutton = makecontrol(option[33]/*nexthtml*/, "next");
						prevbutton = makecontrol(option[32]/*prevhtml*/, "prev");
					}
				};
				
				
				// Lets make those fast/normal/fast into some numbers we can make calculations with.
				b = [1/*controlsfadespeed*/,7/*speed*/,10/*pause*/,18/*speedhistory*/,23/*fadespeed*/];
				for (a in b) {
					option[parseInt10(b[a])] = textSpeedToNumber(option[parseInt10(b[a])]);
				}
				// customlinks. Easy to make, great to use. 
				// And if you wan't it even more flexible, you can use the public methods (http://webbies.dk/SudoSlider/help/) like sudoSlider.goToSlide('next');
				if (option[19]/*customlink*/) 
				{
					$(document).on('click', option[19]/*customlink*/, function() { // When i started making this script, the .live() was brand new, now its deprecated. 
						if (a = $(this).attr('rel')) {
							// Check for special events
							if (a == 'stop') 
							{
								option[9]/*auto*/ = FALSE;
								stopAuto();
							}
							else if (a == 'start')
							{
								timeout = startAuto(option[10]/*pause*/);
								option[9]/*auto*/ = TRUE;
							}
							else if (a == 'block') clickable = FALSE; // Simple, beautifull.
							else if (a == 'unblock') clickable = TRUE; // -||-
							// The general case. 
							// That means, typeof(a) == numbers and first,last,next,prev
							else if (clickable) goToSlide((a == parseInt10(a)) ? a - 1 : a, TRUE);
						}
						return FALSE;
					}); 
				}
				
				
				runOnImagesLoaded(liConti.slice(0,option[39]/*slidecount*/), TRUE, function ()
				{
					// Starting auto
					if (option[9]/*auto*/) timeout = startAuto(option[10]/*pause*/);
					// Lets make those bookmarks and back/forward buttons work. 
					// And startslide etc. 
					// + If re-initiated, the slider will be at the same slide. 
					if (destroyT) animate(destroyT,FALSE,FALSE,FALSE); 
					else if (option[16]/*history*/) {
						// I support the jquery.address plugin, Ben Alman's hashchange plugin and Ben Alman's jQuery.BBQ. 
						// First jQuery.hashchange (i like that one). 
						a = $(window); // BYTES!
						if (i = a.hashchange)
						{
							i(URLChange);
						}
						else if (i = $.address)
						{
							i.change(URLChange);
						}
						// This means that the user must be using jQuery BBQ (I hope so, if not, back/forward buttons wont work in old browsers.)
						else
						{
							a.on('hashchange', URLChange);
						}
						// In any case, i want to run that function once. 
						URLChange();
					}
					// The startslide setting only require one line of code. And here it is:
					// startslide is allways enabled, if not by the user, then by the code. 
					else animate(option[26]/*startslide*/ - 1,FALSE,FALSE,FALSE); 
				});

			    // Preload elements. // Not the startslide, i let the animate function load that. 
			    // If preload is set to a number, then something else entirely happens. 
				if (option[25]/*preloadajax*/ === TRUE) for (i = 0; i <= ts; i++) if (option[24]/*ajax*/[i] && option[26]/*startslide*/ - 1 != i) ajaxLoad(i, FALSE, 0, FALSE);
			}
			/*
			 * The functions do the magic. 
			 */
			// Adjusts the slider when a change in layout has happened. 
			function adjustResponsiveLayout()
			{
				// First adjusting the width of the <li>
				liConti.width(getResponsiveWidth());
				// Then adjusting the slider height (i know that autowidth is turned off)
				autoadjust(t, 0);
				// And placing the slider in the correct position. 
				adjustPosition();
			}
			// Returns the width of a single <li> if the page layout is responsive. 
			function getResponsiveWidth()
			{
				return obj.width() / orgslidecount;
			}
			function URLChange()
			{
				i = filterUrlHash(location.hash.substr(1));
				if (init) animate(i,FALSE,FALSE,FALSE);
				else if (i != t) goToSlide(i, FALSE);
			}
			function startAsyncDelayedLoad ()
			{
				if (option[24]/*ajax*/ && parseInt10(option[25]/*preloadajax*/))
				{
					for (a in option[24]/*ajax*/)
					{
						if (option[24][a])
						{
							clearTimeout(asyncTimedLoad);
							asyncTimedLoad = setTimeout(function(){
								if (option[24][a])
								{
									ajaxLoad(a, FALSE, 0, FALSE);
								}
								else
								{
									// Trying the next, no rush. 
									startAsyncDelayedLoad();
								}
							},parseInt10(option[25]/*preloadajax*/));
							break;
						}
					}
				}
			}
			function startAuto(pause)
			{
				autoOn = TRUE; // The variable telling that an automatic slideshow is running. 
				return setTimeout(function(){
					goToSlide("next", FALSE);
				},pause);
			}
			function stopAuto(autoPossibleStillOn)
			{
				clearTimeout(timeout);
				if (!autoPossibleStillOn) autoOn = FALSE; // The variable telling that auto is no longer in charge. 
			}
			function textSpeedToNumber(speed)
			{	
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
			// I go a long way to save lines of code. 
			function makecontrol(html, action)
			{
			    return $(html).prependTo(controls).click(function () {
					goToSlide(action, TRUE);
					return FALSE;
				});
			}
			// <strike>Simple function</strike><b>A litle complecated function after moving the auto-slideshow code and introducing some "smart" animations</b>. great work. 
			function goToSlide(i, clicked, speed)
			{
                // Stopping, because if its needed then its restarted after the end of the animation. 
			    stopAuto(true);

				beforeanifuncFired = FALSE;
				if (!destroyed)
				{	
					if (option[20]/*fade*/)
					{
						fadeto(i, clicked, FALSE);
					}
					else
					{
						if (option[11]/*continuous*/)
						{
							
							// Just a little smart thing, that stops the slider from performing way to "large" animations. 
							// Not necessary when using fade, therefore i placed it here. 
							// Finding the "real" slide we are at. (-2 == 4 if we got 5 slides). 
							a = filterDir(i);
							i = a;
							// Trying to do some magic, lets se if it works. 
							// I would like to find the shortest distance to the slide i want to slide to. 
							// First the standard route, to the one actually requested. 
							var diff = Math.abs(t-a);
							if (a < option[39]/*slidecount*/-orgslidecount+1 && Math.abs(t - a - s)/* t - (a + s) */ < diff) // if (does any clone exist && is the route the shortest by going to that clone? )
							{
								i = a + s;
								diff = Math.abs(t - a - s); // Setting the new "standard", for how long the animation can be. 
							}
							if (a > ts - option[39]/*slidecount*/ && Math.abs(t - a + s)/* t - (a - s) */  < diff)
							{
								i = a - s;
							}
						}
						else
						{
							i = filterDir(i);
						}
						// And now the animation itself. 
						animate(i,clicked,TRUE,FALSE, speed);
					}
				}
			};
			function fadeControl (fadeOpacity,fadetime,nextcontrol) // It may not sound like it, but the variable fadeOpacity is only for TRUE/FALSE. 
			{
				if (nextcontrol)
				{
					var eA = nextbutton,
					eB = lastbutton,
					directionA = 'next',
					directionB = 'last',
					firstlastshow = option[5]/*lastshow*/;
				}
				else
				{
					var eA = prevbutton,
					eB = firstbutton,
					directionA = 'prev',
					directionB = 'first',
					firstlastshow = option[4]/*firstshow*/;
				}
				if (option[0]/*controlsShow*/)
				{
				    if (fadeOpacity) {
				        if (option[12]/*prevnext*/) eA.filter(":hidden").fadeIn(fadetime);
				        if (firstlastshow) eB.filter(":hidden").fadeIn(fadetime);
				    }
				    else {
				        if (option[12]/*prevnext*/) eA.filter(":visible").fadeOut(fadetime);
				        if (firstlastshow) eB.filter(":visible").fadeOut(fadetime);
				    }
				}
				if(option[19]/*customlink*/)
				{
				    var filterFunction = function () {
				        return ($(this).attr("rel") == directionA || $(this).attr("rel") == directionB);
				    };
				    if (fadeOpacity) {
				        $(option[19]/*customlink*/).filter(filterFunction).filter(":hidden").fadeIn(fadetime);
				    }
				    else {
				        $(option[19]/*customlink*/).filter(filterFunction).filter(":visible").fadeOut(fadetime);
				    }
				} 
			};
			// Fade the controls, if we are at the end of the slide. 
			// It's all the different kind of controls. 
			function fadeControls (a,fadetime)
			{
				fadeControl (a,fadetime,FALSE); // abusing that the number 0 == FALSE. 
				// The new way of doing it. 
				fadeControl(a < s - orgslidecount, fadetime, TRUE);
			};
			// Updating the 'current' class
			function setCurrent(i)
			{
				i = getRealPos(i) + 1;
				if (option[13]/*numeric*/) for (a in numericControls) setCurrentElement(numericControls[a], i);
				if(option[19]/*customlink*/) setCurrentElement($(option[19]/*customlink*/), i);
			};
			function setCurrentElement(element,i)
			{
				if (element.filter)
				{
					element
						.filter(".current")
						.removeClass("current")
						.each(function() {
							if (isFunc(option[30]/*uncurrentfunc*/)){ option[30]/*uncurrentfunc*/.call(this, $(this).attr("rel")); }
						});
						
					element
						.filter(function() { 
							// Tried to do it other ways, but i found that this is the only reliable way of doing it.
							b = $(this).attr("rel");
							if (option[13]/*numeric*/ == 'pages')
							{
								for (a = 0; a < orgslidecount; a++)
								{
									if (b == i - a) return TRUE;
								}
							}
							else return b == i;
							return FALSE; 
						})
						.addClass("current")
						.each(function(index) {
							if (isFunc(option[31]/*currentfunc*/)){ option[31]/*currentfunc*/.call(this, i); }
						});
					}
			};
			// Find out wich numerictext fits the current url. 
			function filterUrlHash(a)
			{
				for (i in option[15]/*numerictext*/) if (option[15]/*numerictext*/[i] == a) return i;
				return a ? t : 0;
			};
			function runOnImagesLoaded (target, allSlides, callback) // This function have to be rock stable, cause i use it ALL the time!
			{
				var elems = target.add(target.find('img')).filter('img');
				var len = elems.length;
				if (!len)
				{
					callback();
					// No need to do anything else. 
					return this;
				}
				function loadFunction(that)
				{
					$(that).off('load error');
					//$(that).unbind('load').unbind('error');
					// Webkit/Chrome (not sure) fix. 
					if (that.naturalHeight && !that.clientHeight)
					{
						$(that).height(that.naturalHeight).width(that.naturalWidth);
					}
					if (allSlides)
					{
						len--;
						if (len == 0)
						{
							callback();
						}
					}
					else
					{
						callback();
					}
				}
				elems.each(function(){
					var that = this;
					$(that).on('load error', function () {
						loadFunction(that);
					});
					/* $(that).load(function () {
						loadFunction(that);
					}).error(function () {
						loadFunction(that);
					}); */
					/*
					 * Start ugly working IE fix. 
					 */
					if (that.readyState == "complete") 
					{
						$(that).trigger("load");	
					}
					else if (that.readyState)
					{
						// Sometimes IE doesn't fire the readystatechange, even though the readystate has been changed to complete. AARRGHH!! I HATE IE, I HATE IT, I HATE IE!
						that.src = that.src; // Do not ask me why this works, ask the IE team!
					}
					/*
					 * End ugly working IE fix. 
					 */
					else if (that.complete)
					{
						$(that).trigger("load");
					}
					else if (that.complete === undefined)
					{
						var src = that.src;
						// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
						// data uri bypasses webkit log warning (thx doug jones)
						that.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="; // This is about the smallest image you can make. 
						that.src = src;
					}
				}); 
			}	
			function autoadjust(i, speed)
			{
				if (speed == 0)
				{
					adjustedTo = i;
				}
				else
				{
					adjustedTo = FALSE;
				}
				
				// Both autoheight and autowidth can be enabled at the same time. It's like magic. 
				if (option[18]/*autoheight*/) autoheightwidth(i, speed, TRUE);//autoheight(i, speed);
				if (option[38]/*autowidth*/) autoheightwidth(i, speed, FALSE);//autowidth(i, speed);
			}
			// Automaticly adjust the height and width, i love this function. 
			// Before i had one function for adjusting height, and one for width. Combining the two saved 134 chars in the minified version. 
			function autoheightwidth(i, speed, axis) // Axis: TRUE == height, FALSE == width.
			{
				obj.ready(function() {// Not using .load(), because that only triggers when something is loaded.
					adjustHeightWidth (i, speed, axis);
					// Then i run it again after the images has been loaded. (If any)
					// I know everything should be loaded, but just in case. 
					runOnImagesLoaded (li.eq(i), FALSE, function(){
						adjustHeightWidth (i, speed, axis);
					});
				});
			};
			function adjustHeightWidth (i, speed, axis)
			{
				var i = getRealPos(i); // I assume that the continuous clones, and the original element is the same height. So i allways adjust acording to the original element.
				var target = li.eq(i);
				// First i run it. In case there are no images to be loaded. 
				b = target[axis ? "height" : "width"]();
				obj.animate(
					axis ? {height : b} : {width : b},
					{
						queue:FALSE,
						duration:speed,
						easing:option[8]/*ease*/
					}
				);
			}
			function adjustPosition()
			{
				// Anything complicated here? No, so move on. The good stuff comes in the next function. 
				ul.css("margin-left",getSlidePosition(t, FALSE)).css("margin-top",getSlidePosition(t, TRUE));
			};
			// <strike>This is a bit complicated, because Firefox won't handle it right. 
			// If i just used .position(), Firefox gets the position 1-2 px off pr. slide (i have no idea why). </strike>
			// Using display:block on #slider li, #slider ul seems to solve the problem. So i'm using .position now.
			function getSlidePosition(slide, vertical)
			{
				// The new way <strike>Doesn't work well in some cases when ajax-loading stuff. </strike>
			    var slide = liConti.eq(slide + (continuousClones ? option[39]/*slidecount*/ : 0));
				return slide.length ? - slide.position()[vertical ? 'top' : 'left'] : 0;
			};
			// When the animation finishes (fade or sliding), we need to adjust the slider. 
			function adjust()
			{
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
				    }
				    // Continuing if not clicked.
				    else timeout = startAuto(option[10]/*pause*/);
				}

				if (!fading && beforeanifuncFired) {
				    AniCall(t, TRUE); // I'm not running it at init, if i'm loading the slide. 
				}
			};
			// This function is called when i need a callback on the current element and it's continuous clones (if they are there).
			function AniCall (i, after) // after ? TRUE == afteranifunc : FALSE == beforeanifunc;
			{
				// <strike> New method. </strike> New new method, now we only call the method once.  
				i = getRealPos(i);
				var callBackThis = $();
				for (a in callBackList[i])
				{
					callBackThis = callBackThis.add(callBackList[i][a]);
				}
				(after ? afterAniCall : beforeAniCall)(callBackThis, i + 1);
			
			}
			function afterAniCall(el, a)
			{
				if (isFunc(option[29]/*afteranifunc*/)) option[29]/*afteranifunc*/.call(el, a);
			}
			function beforeAniCall(el, a)
			{
				if (isFunc(option[28]/*beforeanifunc*/)) option[28]/*beforeanifunc*/.call(el, a);
			}
			// Convert the direction into a usefull number.
			function filterDir(dir)
			{
				if (dir == 'next')
				{
					return limitDir(t + 1 + option[41]/*movecount*/, dir);
				}
				else if (dir == 'prev')
				{
					return limitDir(t - 1 - option[41]/*movecount*/, dir);
				}
				else if (dir == 'first')
				{
					return 0;
				}
				else if (dir == 'last')
				{
					return ts;
				}
				else
				{
					return limitDir(parseInt10(dir), dir);
				}
			};
			// If continuous is off, we sometimes do not want to move to far. 
			// This method was added in 2.1.8, se the changelog as to why. 
			function limitDir(i, dir)
			{
				if (option[11]/*continuous*/)
				{
					return getRealPos(i);
				}
				else
				{
					var maxSlide = s - orgslidecount;
					if (i > maxSlide)
					{
						if (t == maxSlide && dir == 'next')
						{
							return 0;
						}
						else
						{
							return maxSlide;
						}
					}
					else if (i < 0)
					{
						if (t == 0 && dir == 'prev')
						{
							return maxSlide;
						}
						else
						{
							return 0;
						}
					}
					else
					{
						return i;
					}
				}
			}
			// Load a ajax document (or i image) into a list element. 
			// If testing this locally (loading everything from a harddisk instead of the internet), it may not work. 
			// But then try to upload it to a server, and see it shine. 
			function ajaxLoad(i, adjust, speed, ajaxCallBack)
			{
				if (asyncTimedLoad) clearTimeout(asyncTimedLoad);// I dont want it to run to often. 
				// <strike>Not as complicated as it looks. </strike> Everything complicated about this line disappeared in version 2.0.12
				var target = option[24]/*ajax*/[i];
				var targetslide = li.eq(i);
				// parsing the init variable. 
				var ajaxInit = speed === TRUE;
				var speed = (speed === TRUE) ? 0 : speed;
				// What speed should the autoheight function animate with?
				var ajaxspeed = (fading) ? (!option[21]/*crossfade*/ ? parseInt10(option[22]/*fadespeed*/ * (2/5)) : option[22]/*fadespeed*/) : speed;
				// The script itself is not using the 'tt' variable. But a custom function can use it. 
				var tt = i + 1;
				var textloaded = FALSE;
				
				// The thing that loads it. 
				$.ajax({
					url: target,
					success: function(data, textStatus, jqXHR){
						var type = jqXHR.getResponseHeader('Content-Type').substr(0,5);
						if (type != 'image')
						{
							textloaded = TRUE;
							targetslide.html(data);
							ajaxAdjust(i, speed, ajaxCallBack, adjust, ajaxInit, FALSE);
						}
					},
					complete: function(jqXHR){
						// Some browsers wont load images this way, so i treat an error as an image. 
						// There is no stable way of determining if it's a real error or if i tried to load an image in a old browser, so i do it this way. 
						if (!textloaded)
						{
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
				if (continuousClones)
				{
					var notFirst = FALSE;
					for (a in callBackList[i])
					{
					    if (notFirst) {
					        var newSlide = target.clone();
					        continuousClones.push(newSlide);
					        callBackList[i][a].replaceWith(newSlide);
					        callBackList[i][a] = newSlide;
					        callbackTarget = callbackTarget.add(newSlide);
					    }
						notFirst = TRUE;
					}
					
					// The below doesn't work 
					//if (i < option[39]/*slidecount*/) liConti.eq((i<0) ? i + option[39]/*slidecount*/ : i - option[39]/*slidecount*/).replaceWith($(target).clone());
					//if (i > ts - option[39]/*slidecount*/) liConti.eq(option[39]/*slidecount*/ + i - ts - 1).replaceWith($(target).clone());
					
					// The liConti gets messed up a bit in the above code, therefore i fix it. 
					liConti = ul.children("li");
					//if (ajaxInit === TRUE) adjustPosition();// Only doing this little trick at init. 
				}
				// Adjusting if we are supposed to, or if we already are supposed to be adjusted to it. 
				if (adjust || adjustedTo == i) autoadjust(i, speed);
				
				runOnImagesLoaded (target, TRUE, function(){
					if (ajaxInit === TRUE) adjustPosition();// Doing this little trick after the images are done. 
					// And the callback. 
					if (isFunc(ajaxCallBack)) ajaxCallBack();
					startAsyncDelayedLoad();
				    // If we want, we can launch a function here. 
					if (isFunc(option[27]/*ajaxloadfunction*/)) { option[27]/*ajaxloadfunction*/.call(callbackTarget, parseInt10(i) + 1, img); }
				});
			    
				// In some cases, i want to call the beforeanifunc here. 
				if (ajaxCallBack == 2)
				{
					AniCall(i, FALSE);
					if (!beforeanifuncFired)
					{
						AniCall(i, TRUE);
						beforeanifuncFired = TRUE;
					}
				}
				
			};
			// It's not only a slider, it can also fade from slide to slide. 
			function fadeto(i, clicked, ajaxcallback)
			{
				if (filterDir(i) != t && !destroyed && clickable) // We doesn't want something to happen all the time. The URL can change a lot, and cause som "flickering". 
				{
					// Just leave the below code as it is, i've allready spent enough time trying to improve it, it allways ended up in me making nothing that worked like it should. 
					ajaxloading = FALSE;
					// Update the current class of the buttons. 
					if (option[23]/*updateBefore*/) setCurrent(filterDir(i));
					// Setting the speed. 
					if (!(speed || speed == 0)) var speed = (!clicked && !option[9]/*auto*/ && option[16]/*history*/) ? option[22]/*fadespeed*/ * (option[17]/*speedhistory*/ / option[7]/*speed*/) : option[22]/*fadespeed*/,
					// I don't want to fade to a continuous clone, i go directly to the target. 
					ll = filterDir(i);
					// Lets make sure the prev/next buttons also fade. 
					if(option[2]/*controlsfade*/) fadeControls (ll,option[1]/*controlsfadespeed*/);

					
					if (ajaxcallback)
					{
						speed = oldSpeed;
						// Do a check if it can continue.
						if (dontCountinueFade) dontCountinueFade--; // It is nice that 0 is falsy
					}
					else if (option[24]/*ajax*/)
					{
						// Before i can fade anywhere, i need to load the slides that i'm fading too (needs to be done before the animation, since the animation includes cloning of the target elements. 
						dontCountinueFade = 0;
						oldSpeed = speed;
						for (a = ll; a < ll + orgslidecount; a++)
						{
							if (option[24]/*ajax*/[a])
							{
								ajaxLoad(getRealPos(a), FALSE, speed, function(){
									fadeto(i, clicked, TRUE);
								});
								dontCountinueFade++;
							}
						}
					}
					else
					{
						dontCountinueFade = FALSE;
					}
					if (!dontCountinueFade) // if (dontCountinueFade == 0)
					{
						// Only clickable if not clicked.
						clickable = !clicked;
						autoadjust(ll,option[22]/*fadespeed*/); // The height animation takes the full lenght of the fade animation (fadein + fadeout if it's not crossfading).  
						// So lets run the function.
						AniCall(ll, FALSE);
						// Crossfading?
						if (option[21]/*crossfade*/)
						{
							var firstRun = TRUE;
							var push = 0;
							// Define the target. Maybe more than one. 
							for (a = ll; a < ll + orgslidecount; a++)
							{
								// I clone the target, and fade it in, then hide the cloned element while adjusting the slider to show the real target.
								var clone = li.eq(getRealPos(a)).clone().prependTo(obj);
								// I do not think the below line is needed, comment in if you have problems with an beforeanifunc not working when fading. 
								//if (isFunc(option[28]/*beforeanifunc*/)) option[28]/*beforeanifunc*/.call(clone, getRealPos(a)+1);
								clone.css({'z-index' : '10000', 'position' : 'absolute', 'list-style' : 'none', 'top' : option[6]/*vertical*/ ? push : 0, 'left' : option[6]/*vertical*/ ? 0 : push}).
								// Lets fade it in. 
								hide().fadeIn(option[22]/*fadespeed*/, option[8]/*ease*/, function() {
									fixClearType(this);
									// So the animate function knows what to do. 
									clickable = TRUE;
									fading = TRUE;
									if (firstRun)
									{
										animate(ll,clicked,FALSE,FALSE); // Moving to the correct place. // TODO: Test "clicked" instead of "FALSE". 
										if(option[16]/*history*/ && clicked) window.location.hash = option[15]/*numerictext*/[t]; // It's just one line of code, no need to make a function of it. 
										// Now run that after animation function.
										AniCall(ll, TRUE);
										firstRun = FALSE;
									}
									// Removing the clone, if i dont, it will just be a pain in the ... .
									$(this).remove();
									
									// Lets put that variable back to the default (and not during animation) value. 
									fading = FALSE;
									
								});
								push += getResponsiveWidth(); //clone[option[6]/*vertical*/ ? 'outerHeight' : 'outerWidth'](TRUE);
							}
						}
						else
						{
							// fadeOut and fadeIn.
							var fadeinspeed = parseInt10((speed)*(3/5));
							var fadeoutspeed = speed - fadeinspeed;
							liConti.each(function ()
							{
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
											animate(ll,FALSE,FALSE,FALSE); // Moving to the correct place.
											// Only clickable if not clicked.
											clickable = !clicked; 
											// Now, lets fade the slider back in. 
											$(this).animate(
												{ opacity: 1 },
												{
													queue:FALSE,
													duration:fadeinspeed,
													easing:option[8]/*ease*/,
													complete:function () {
														fixClearType(this);
														if(option[16]/*history*/ && clicked) window.location.hash = option[15]/*numerictext*/[t]; // It's just one line of code, no need to make a function of it. 
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
			function animate(dir,clicked,time,ajaxcallback,speed) // (Direction, did the user click something, is this to be done in >1ms?, is this inside a ajaxCallBack?) 
			{
				if ((clickable && !destroyed && (dir != t || init)) && s >  getRealPos(dir) || ajaxcallback)
				{
					if (!ajaxcallback) ajaxloading = FALSE;
					clickable = !clicked && !option[9]/*auto*/;
					// to the adjust function. 
					buttonclicked = clicked;
					ot = t;
					t = dir;
					if (option[23]/*updateBefore*/ && !fading) setCurrent(t);
					// Calculating the speed to do the animation with. 
					var diff = Math.sqrt(Math.abs(ot-t));
					if (!(speed || speed == 0))	var speed = (!time) ? 0 : ((!clicked && !option[9]/*auto*/) ? parseInt10(diff*option[17]/*speedhistory*/) : parseInt10(diff*option[7]/*speed*/)),
					// Ajax begins here 
					// I also these variables in the below code (running custom function).
					i = getRealPos(t);
					if (ajaxcallback)
					{
						speed = oldSpeed;
						// Do a check if it can continue.
						if (dontCountinue) dontCountinue--; // It is nice that 0 == FALSE;
					}
					else if (option[24]/*ajax*/)
					{
						// Loading the target slide, if not already loaded. 
						if (option[24]/*ajax*/[i]) 
						{
							ajaxLoad(i, TRUE, init || speed, 2); // 2 for AniCall
							ajaxloading = TRUE;
						}
						// The slider need to have all slides that are scrolled over loaded, before it can do the animation.
						// That's not easy, because the slider is only loaded once a callback is fired. 
						if (!fading)
						{
							// A tiny dragon do live within this cave.
							var aa = (ot>t) ? t : ot,
							ab = (ot>t) ? ot : t;
							dontCountinue = 0;
							oldSpeed = speed;
							for (a = aa; a <= ab; a++)
							{
								if (a<=ts && a>=0 && option[24]/*ajax*/[a])
								{
									ajaxLoad(a, FALSE, speed, function(){
										animate(dir,clicked,time, TRUE);
									});
									dontCountinue++;
								}
							}
							// The tiny dragon just shrunk.
						}
						// Then we have to preload the next ones. 
						for (a = i+1; a <= i + orgslidecount; a++)
						{
							if (option[24]/*ajax*/[a]) ajaxLoad(a, FALSE, 0, FALSE);
						}
					}
					if (!dontCountinue)
					{
						if (!fading && !ajaxloading)
						{
							// Lets run the beforeAniCall
							AniCall(i, FALSE);
							beforeanifuncFired = TRUE;
						}
						if (!fading) autoadjust(t, speed);
						ul.animate(
							{ marginTop: getSlidePosition(t, TRUE), marginLeft: getSlidePosition(t, FALSE)},
							{
								queue:FALSE,
								duration:speed,
								easing: option[8]/*ease*/,
								complete: adjust
							}
						);
						// End animation. 
						
						// Fading the next/prev/last/first controls in/out if needed. 
						if(option[2]/*controlsfade*/)
						{
							var fadetime = option[1]/*controlsfadespeed*/;
							if (!clicked && !option[9]/*auto*/) fadetime = (option[17]/*speedhistory*/ / option[7]/*speed*/) * option[1]/*controlsfadespeed*/;					
							if (!time) fadetime = 0;
							if (fading) fadetime = parseInt10((option[22]/*fadespeed*/)*(3/5));
							fadeControls (t,fadetime);
						}
						// startAsyncDelayedLoad doesn't start by itself, it does only when another ajax load has finished (or in the below line). 
						if (init) if (!option[24]/*ajax*/[i]) startAsyncDelayedLoad();
						// Stop init, first animation is done. 
						init = FALSE; //nasty workaround, but it works. 
						
					};
				}
			};
			function getRealPos(a) //instead of the position of the "continuous-clone"
			{
				// Fixes an infinite loop if there are 0 slides in the slider. 
				if (s == 0)
				{
					return 0;
				}
				a = parseInt10(a);
				while (a < 0)
				{
					a += s;	
				}
				return a % s;
			}
			function isFunc(func) //Closure compiler inlines this. But i still keep it. 
			{
				return $.isFunction(func);
			}
			// This fixes rare but potential bugs and saves space (when i talk about saving space, i allways talk about the minified version, this version (the unminified) is used when people want to debug or change the code (yes, that happens!)). 
			function parseInt10(num)
			{
				return parseInt(num, 10);
			}
			function fixClearType (element)
			{
				if (screen.fontSmoothingEnabled) element.style.removeAttribute("filter"); // Fix cleartype
			}
		   /*
			* Public methods. 
			*/
			
			// First i just define those i use more than one (with a "public" prefix). Then i just add the others as anonymous functions.
			function publicDestroy(){
				// Saving the current position.
				destroyT = t;
				// Stopping the slider from reacting on window resize (if it ever did). 
				if (option[42]/*responsive*/)
				{
					$(window).off("resize focus", adjustResponsiveLayout);
				}
				// First, i remove the controls. 
				if (controls) controls.remove(); // that's it.
				// Now to set a variable, so nothing is run. 
				destroyed = TRUE; // No animation, no fading, no clicking from now. 
				// Then remove the customlink bindings:
				$(option[19]/*customlink*/).die("click");
			    // Now remove the "continuous clones". 
				if (continuousClones) {
				    for (var i = 0; i < continuousClones.length; i++) {
				        continuousClones[i].remove();
				    }
				}
				// if (continuousClones) for (a=1;a<=Math.min([39]/*slidecount*/, s);a++) liConti.eq(a-1).add(liConti.eq(-a)).remove();
				// I need the slider to be at the same place.
				adjustPosition();
				// And now it's done. The only way to make this slider do something visible, is by making a new init. 
			}
			addMethod("destroy", publicDestroy);
			function publicInit(){
				// Two inits can really fuck things up. I tried. 
				if (destroyed) {
					initSudoSlider(obj, destroyT);	
				}
			}
			addMethod("init", publicInit);
			
			// Now the anonyous functions, i do not use these within the script. 
			addMethod("getOption", function(a){
				return options[a.toLowerCase()];
			});
			
			addMethod("setOption", function(a, val){
				publicDestroy(); // Make it easy to work. 
				options[a.toLowerCase()] = val; // Sets the semi-global option. 
				publicInit(); // This makes sure that the semi-local options is inserted into the slide again. 
			});
			
			addMethod("insertSlide", function (html, pos, numtext, goToSlide) {
				// First we make it easier to work. 
				publicDestroy();
				// pos = 0 means before everything else. 
				// pos = 1 means after the first slide.
				if (pos > s) pos = s; // If you try to add a slide after the last slide fix. 
				var html = '<li>' + html + '</li>';
				if (!pos || pos == 0) ul.prepend(html);
				else li.eq(pos -1).after(html);
				// Finally, we make it work again. 
				if (goToSlide) {
				    destroyT = goToSlide - 1;
				}
				else if (pos <= destroyT || (!pos || pos == 0)) {
				    destroyT++;
				}
				if (option[15]/*numerictext*/.length < pos){ option[15]/*numerictext*/.length = pos;}
				option[15]/*numerictext*/.splice(pos,0,numtext || parseInt10(pos)+1);
				publicInit();
			});
			
			addMethod("removeSlide", function(pos){
				pos--; // 1 == the first. 
				// First we make it easier to work. 
				publicDestroy();
				// Then we work. 
				li.eq(pos).remove();
				option[15]/*numerictext*/.splice(pos,1);
				if (pos < destroyT) destroyT--;
				// Finally, we make it work again. 
				publicInit();
			});
			
			addMethod("goToSlide", function(a, speed){
				goToSlide((a == parseInt10(a)) ? a - 1 : a, TRUE, speed);
			});
			
			addMethod("block", function(){
				clickable = FALSE; // Simple, beautifull.
			});
			
			addMethod("unblock", function(){
				clickable = TRUE; // Simple, beautifull.
			});
			
			addMethod("startAuto", function(){
				option[9]/*auto*/ = TRUE;
				timeout = startAuto(option[10]/*pause*/);
			});			
			
			addMethod("stopAuto", function(){
				option[9]/*auto*/ = FALSE;
				stopAuto();
			});	
	
			// This method adjusts the height, width and position of the slider with the specified animation time. 
			// I couldn't find it anywhere in the docs, and i do not remeber adding it. Might add it to the docs later. 
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
			    var slides = $();
			    for (a in callBackList[number]) {
			        slides = slides.add(callBackList[number][a]);
			    }
			    return slides;
			});
			
		});
	};
})(jQuery);
// If you did just read the entire code, congrats. 
// Did you find a bug? I didn't, so plz tell me if you did. (http://webbies.dk/SudoSlider/help/ask-me.html)