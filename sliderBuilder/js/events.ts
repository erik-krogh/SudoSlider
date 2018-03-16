/// <reference path="lib/jquery.d.ts" />
/// <reference path="sudoSliderAngular.ts" />

class EventBus {
    private handlers: any = {}; // Map from functions to arrays of callbacks.
    private lastEvent: any = {};

    register(clazz, callback: (event: any) => any, sendLast : boolean = false, win: any = null) {
        var name = clazz.name;
        var classObject  = this.handlers[name];
        if (!classObject) {
            classObject = {clazz: clazz, handlers: []};
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
    }

    fireEvent(event) {
        var name = event.constructor.name;
        this.lastEvent[name] = event;
        var classObject  = this.handlers[name];
        if (classObject) {
            var handlers = classObject.handlers;
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](event);
            }
        }
    }

    private static instance = new EventBus();
    static getInstance() {
        // Global, I'm serious.
        var win : any = window;
        while (win.opener) {
            win = win.opener;
        }
        return win.EventBus.instance;
    }
}


class SudoSliderApiEvent {
    callback:(api:any) => any;
    name:string;

    constructor(callback:(api:any) => any, name:string) {
        this.callback = callback;
        this.name = name;
    }
}

class SudoSliderUpdateOptionsEvent {
    newDefinitions:OptionDefinition[];

    constructor(newDefinitions:OptionDefinition[]) {
        this.newDefinitions = newDefinitions;
    }
}

class SudoSliderSlidesUpdateEvent {
    newSlides:{html: string}[];

    constructor(newSlides:{html: string}[]) {
        this.newSlides = newSlides;
    }
}

class SliderBuilderStyleChangeEvent {
    style : string;
    constructor(style: string) {
        this.style = style;
    }
}

class RegisterWindowEvent {
    win : Window;
    constructor(win : Window) {
        this.win = win;
    }
}

class ImportEvent {
    slides:{html: string}[];
    style : string;
    definitions:OptionDefinition[];
    constructor(slides:{html: string}[], style : string, definitions:OptionDefinition[]) {
        this.slides = slides;
        this.style = style;
        this.definitions = definitions;
    }
}