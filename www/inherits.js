inherits = function (Child, Parent) {
	Child.prototype = Object.create(Parent.prototype, {
		constructor: {
			value: Child,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});
};