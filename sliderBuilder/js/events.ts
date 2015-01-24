class EventBus {
    private handlers:any = []; // Map from functions to arrays of callbacks.

    register(clazz, callback: (event: any) => any) {
        var classObject = this.findClassObject(clazz);
        classObject || this.handlers.push(classObject = {clazz: clazz, handlers: [] });
        classObject.handlers.push(callback);
    }

    fireEvent(event) {
        var classObject = this.findClassObject(event.constructor);
        if (classObject) {
            var handlers = classObject.handlers;
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](event);
            }
        }
    }

    private findClassObject(clazz) {
        for (var i = 0; i < this.handlers.length; i++) {
            if (this.handlers[i].clazz === clazz) {
                return this.handlers[i];
            }
        }
        return false;
    }
}