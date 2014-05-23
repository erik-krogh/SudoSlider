/*
 *  Properload 1.0.1
 *  Written by Erik Kristensen info@webbies.dk. 
 *
 *  Licensed under MIT and GPL license.
 *
 *  Used to run a callback, when all or one image in a group has been loaded.
 *
 */
(function ($) {
    var undefined;
    $.fn.properload = function (userCallback, waitForAllImages) {
        if (waitForAllImages === undefined) {
            waitForAllImages = true;
        }
        var target = $(this);
        var finalCallback = function () {
            userCallback.call(target);
        };
        if (!target) {
            finalCallback();
            return;
        }
        var elems = target.add(target.find("img")).filter("img");
        var len = elems.length;
        if (!len) {
            finalCallback();
            return;
        }


        elems.each(function () {
            var that = this;
            var jQueryThat = $(that);
            jQueryThat.one('load error', function () {
                if (waitForAllImages) {
                    len--;
                    if (len == 0) {
                        finalCallback();
                    }
                } else {
                    userCallback.call(that);
                }
            });
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
    };

    function makeCallback(func, args) {
        return function () {
            func.apply(undefined, args);
        }
    }
})(jQuery);