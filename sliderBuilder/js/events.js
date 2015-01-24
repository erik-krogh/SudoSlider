var EventBus = (function () {
    function EventBus() {
        this.handlers = []; // Map from functions to arrays of callbacks.
    }
    EventBus.prototype.register = function (clazz, callback) {
        var classObject = this.findClassObject(clazz);
        classObject || this.handlers.push(classObject = { clazz: clazz, handlers: [] });
        classObject.handlers.push(callback);
    };
    EventBus.prototype.fireEvent = function (event) {
        var classObject = this.findClassObject(event.constructor);
        if (classObject) {
            var handlers = classObject.handlers;
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](event);
            }
        }
    };
    EventBus.prototype.findClassObject = function (clazz) {
        for (var i = 0; i < this.handlers.length; i++) {
            if (this.handlers[i].clazz === clazz) {
                return this.handlers[i];
            }
        }
        return false;
    };
    return EventBus;
})();
//# sourceMappingURL=events.js.map