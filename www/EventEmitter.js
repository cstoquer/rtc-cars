var EventEmitter;

(function(){

EventEmitter = function () {
	this.eventHandlers = {};
};

EventEmitter.prototype.on = function (evt, fn) {
	if (typeof fn !== 'function') {
		console.warn('Tried to register non-function', fn, 'as event handler for event:', evt);
		return;
	}

	this.emit('newListener', evt, fn);

	var allHandlers = this.eventHandlers;
	var evtHandlers = allHandlers[evt];
	if (evtHandlers === undefined) {
		// first event handler for this event type
		allHandlers[evt] = [fn];
		return;
	}

	evtHandlers.push(fn);
};

EventEmitter.prototype.add = EventEmitter.prototype.on;

EventEmitter.prototype.once = function (evt, fn) {
	if (!fn.once) {
		fn.once = 1;
	} else {
		fn.once += 1;
	}

	this.on(evt, fn);
};


EventEmitter.prototype.removeListener = function (evt, handler) {
	// like node.js, we only remove a single listener at a time, even if it occurs multiple times

	var handlers = this.eventHandlers[evt];
	if (handlers !== undefined) {
		var index = handlers.indexOf(handler);
		if (index !== -1) {
			handlers.splice(index, 1);
			this.emit('removeListener', evt, handler);
			if (handlers.length === 0) {
				delete this.eventHandlers[evt];
			}
		}
	}
};


EventEmitter.prototype.removeAllListeners = function (evt) {
	if (evt) {
		delete this.eventHandlers[evt];
	} else {
		this.eventHandlers = {};
	}
};


EventEmitter.prototype.hasListeners = function (evt) {
	return (this.eventHandlers[evt] !== undefined);
};


EventEmitter.prototype.listeners = function (evt) {
	var handlers = this.eventHandlers[evt];
	if (handlers !== undefined) {
		var len = handlers.length;

		var fns = new Array(len);

		for (var i = 0; i < len; i++) {
			fns[i] = handlers[i];
		}

		return fns;
	}

	return [];
};


var slice = Array.prototype.slice;
EventEmitter.prototype.emit = function (evt) {

	var handlers = this.eventHandlers[evt];
	if (handlers === undefined) {
		return;
	}

	// copy handlers into a new array, so that handler removal doesn't affect array length
	handlers = handlers.slice();

	var args = slice.call(arguments, 1);

	for (var i = 0, len = handlers.length; i < len; i++) {
		var handler = handlers[i];
		if (handler === undefined) {
			continue;
		}

		handler.apply(this, args);

		if (handler.once) {
			if (handler.once > 1) {
				handler.once--;
			} else {
				delete handler.once;
			}

			this.removeListener(evt, handler);
		}
	}
};


})()