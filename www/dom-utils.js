var DOCUMENT_BODY = document.getElementsByTagName('body')[0];

function createDom(dom, className, parent) {
	parent = parent || DOCUMENT_BODY;
	var dom = document.createElement(dom);
	parent.appendChild(dom);
	dom.className = className;
	return dom;
}

function createDiv(className, parent) {
	return createDom('div', className, parent)
}

function removeDom(dom, parent) {
	parent = parent || DOCUMENT_BODY;
	parent.removeChild(dom);
}