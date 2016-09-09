var peerManager = window.peerManager;

var userInfos = {
	name:  Math.random().toString(36).slice(-10),
	color: hslToRgb(Math.random(), 0.8, 0.6),
};

var userCar;
var cars = [];


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Creation of game elements:
 * - Cars field arena
 * - update loop
 * - controls
 */
var canvas = createDom('canvas');
canvas.width  = 400;
canvas.height = 400;
var ctx = canvas.getContext('2d');

var FRAME_INTERVAL = 1/60;
var requestAnimFrame = (function getRequestAnimationFunction() {
	return window.requestAnimationFrame    ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function nextFrame(callback) {
			window.setTimeout(callback, FRAME_INTERVAL);
		};
})();

function update() {
	ctx.clearRect(0, 0, 400, 400);
	for (var i = 0; i < cars.length; i++) {
		cars[i].update();
		cars[i].render(ctx);
	}
	requestAnimFrame(update);
}

var btnAccel, btnLeft, btnRight;

function onKeyPressed(e) { userCar.keyChange(e.keyCode, true);  }
function onKeyRelease(e) { userCar.keyChange(e.keyCode, false); }

function startControls() {
	if ('ontouchstart' in window) {
		btnAccel = createDiv('controlButton');
		btnLeft  = createDiv('controlButton');
		btnRight = createDiv('controlButton');
		btnAccel.style.left  = '10px';
		btnLeft.style.right  = '70px';
		btnRight.style.right = '10px';

		btnAccel.addEventListener('touchstart', function onTouchStart() { userCar.keyChange(38, true); });
		btnRight.addEventListener('touchstart', function onTouchStart() { userCar.keyChange(39, true); });
		btnLeft.addEventListener('touchstart',  function onTouchStart() { userCar.keyChange(37, true); });

		btnAccel.addEventListener('touchend', function onTouchEnd() { userCar.keyChange(38, false); });
		btnRight.addEventListener('touchend', function onTouchEnd() { userCar.keyChange(39, false); });
		btnLeft.addEventListener('touchend',  function onTouchEnd() { userCar.keyChange(37, false); });
	} else {
		window.addEventListener('keydown', onKeyPressed);
		window.addEventListener('keyup',   onKeyRelease);
	}
};

function stopControls() {
	if ('ontouchstart' in window) {
		removeDom(btnAccel);
		removeDom(btnLeft);
		removeDom(btnRight);
	} else {
		window.removeEventListener('keydown', onKeyPressed);
		window.removeEventListener('keyup',   onKeyRelease);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Connection to server */
function connect() {
	var socket = io.connect('http://' + window.document.domain);

	peerManager.init(userInfos, socket);
	socket.emit('broadcast', { info: userInfos });

	window.onunload = function onUnload() {
		socket.emit('disconnect');
		socket.disconnect();
	}

	socket.on('disconnect', function onDisconnect() {
		console.log('>>> lost connection with server');
	});

	userCar = new Car(socket.socket.sessionid, null, userInfos.color);
	userCar.respawn(200, 200);
	cars.push(userCar);
	startControls();
	update();
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Main UI */
var userTitle    = createDiv();
var userColorBox = createDiv('userColor', userTitle);
var userNameBox  = createDiv('userName',  userTitle);
userColorBox.style.backgroundColor = userInfos.color;
userNameBox.textContent = userInfos.name;

// name input and connect button
var input = createDom('input', 'input');
var connectButton = createDiv('button');
connectButton.textContent = 'go';

connectButton.addEventListener('mousedown', function onTap(e) {
	if (input.value !== '') userNameBox.textContent = userInfos.name = input.value;
	connect();
	removeDom(connectButton);
	removeDom(input);
});

// container for peer boxes
var peerContainer = createDiv('peerContainer');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** When a new peer connects to the server */
peerManager.on('newPeer', function onNewPeer(peer) {
	var peerColor = peer.info.color;

	// create peerBox dom elements (name + chat box)
	var dom = createDiv('peer', peerContainer);
	dom.textContent = '> ' + peer.info.name;
	var chatContainer = createDiv('chatContainer', dom);
	var chatBox;
	var sendBtn;

	peer.on('disconnect', function onPeerDisconnection() {
		removeDom(dom, peerContainer);
	});

	// adding a message in chat
	function addMessage(data, direction) {
		var messageBox = createDiv('messageBox', chatContainer);
		var text = direction ? '> ' : '';
		text += data;
		text += direction ? '' : ' <';
		messageBox.textContent = text;
		messageBox.style.textAlign = direction ? 'left' : 'right';
	}

	// on peer message
	peer.on('chatMessage', function onChatMessage(data) {
		addMessage(data.content, true);
	});

	// update peer box + create chat
	function createPeerChatBox() {
		dom.style.backgroundColor = peerColor;
		if (chatBox) return;
		var container = createDiv('container', dom);
		chatBox = createDom('input', 'input', container);
		sendBtn = createDiv('button', container);
		chatBox.style.textAlign = 'right';
		sendBtn.textContent = 'send';
		sendBtn.addEventListener('mousedown', function onTap(e) {
			if (chatBox.value === '') return;
			var msg = chatBox.value;
			peer.send({ _type: 'chatMessage', content: msg });
			addMessage(msg, false);
			chatBox.value = '';
		});
	}

	// start rtc connection button
	function startRtc() {
		if (peer.ready) return;
		peer.startRTC();
		dom.removeEventListener('mousedown', startRtc);
	}

	dom.addEventListener('mousedown', startRtc);

	// peer car is created once connected to this peer
	function createPeerCar() {
		var car = new Car(peer.socketId, peer, peerColor);
		cars.unshift(car);

		peer.on('carSync', function onCarSync(data) {
			car.sync(data.sync);
		});

		// sync user car state to this peer: every 500ms and when user car control changes
		function syncUserCar() {
			peer.send({ _type: 'carSync', sync: userCar.getState() });
		}

		var interval = window.setInterval(syncUserCar, 500);
		userCar.on('keyChanged', syncUserCar);

		// when peer disconnects, reemove his car
		peer.on('disconnect', function onPeerDisconnection() {
			window.clearInterval(interval);
			var index = cars.indexOf(car);
			if (index < 0) return console.error('No car');
			cars.splice(index, 1);
		})
	}

	// create chat and car when peer is ready
	peer.on('ready', function onPeerReady() {
		createPeerChatBox();
		createPeerCar();
	});
	
});




