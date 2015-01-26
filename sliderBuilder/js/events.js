/// <reference path="lib/jquery.d.ts" />
/// <reference path="sudoSliderAngular.ts" />
var EventBus = (function () {
    function EventBus() {
        this.handlers = {}; // Map from functions to arrays of callbacks.
        this.lastEvent = {};
    }
    EventBus.prototype.register = function (clazz, callback, sendLast, win) {
        if (sendLast === void 0) { sendLast = false; }
        if (win === void 0) { win = null; }
        var name = clazz.name;
        var classObject = this.handlers[name];
        if (!classObject) {
            classObject = { clazz: clazz, handlers: [] };
            this.handlers[name] = classObject;
        }
        var handlers = classObject.handlers;
        handlers.push(callback);
        if (sendLast && this.lastEvent[name]) {
            callback(this.lastEvent[name]);
        }
        if (win !== null) {
            $(win).on("beforeunload", function () {
                for (var i = 0; i < handlers.length; i++) {
                    if (handlers[i] === callback) {
                        handlers.splice(i, 1);
                        break;
                    }
                }
            });
        }
    };
    EventBus.prototype.fireEvent = function (event) {
        var name = event.constructor.name;
        this.lastEvent[name] = event;
        var classObject = this.handlers[name];
        if (classObject) {
            var handlers = classObject.handlers;
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](event);
            }
        }
    };
    EventBus.getInstance = function () {
        // Global, I'm serious.
        var win = window;
        if (!win) {
            alert("This is bad!");
        }
        while (win.opener) {
            win = win.opener;
        }
        return win.EventBus.instance;
    };
    EventBus.instance = new EventBus();
    return EventBus;
})();
var SudoSliderApiEvent = (function () {
    function SudoSliderApiEvent(callback, name) {
        this.callback = callback;
        this.name = name;
    }
    return SudoSliderApiEvent;
})();
var SudoSliderUpdateOptionsEvent = (function () {
    function SudoSliderUpdateOptionsEvent(newDefinitions) {
        this.newDefinitions = newDefinitions;
    }
    return SudoSliderUpdateOptionsEvent;
})();
var SudoSliderSlidesUpdateEvent = (function () {
    function SudoSliderSlidesUpdateEvent(newSlides) {
        this.newSlides = newSlides;
    }
    return SudoSliderSlidesUpdateEvent;
})();
var SliderBuilderStyleChangeEvent = (function () {
    function SliderBuilderStyleChangeEvent(style) {
        this.style = style;
    }
    return SliderBuilderStyleChangeEvent;
})();
//# sourceMappingURL=events.js.map