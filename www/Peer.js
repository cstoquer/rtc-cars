var Peer;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** @module Peer, handle the connection with a simple peer.
 *  @author Cedric Stoquer
 *
 * The RTCPeerConnection interface represents a WebRTC connection between the local computer 
 * and a remote peer. It is used to handle efficient streaming of data between the two peers.
 * 
 * Note: RTCPeerConnection and RTCSessionDescription are currently prefixed in most browsers,
 *       and the navigator.getUserMedia() method is prefixed in many versions of some browsers;
 */

(function(){

var RTCPeerConnection     = window.RTCPeerConnection
                         || window.mozRTCPeerConnection
                         || window.webkitRTCPeerConnection
                         || window.msRTCPeerConnection;

var RTCIceCandidate       = window.RTCIceCandidate
                         || window.mozRTCIceCandidate
                         || window.webkitRTCIceCandidate
                         || window.msRTCIceCandidate;

var RTCSessionDescription = window.RTCSessionDescription
                         || window.mozRTCSessionDescription
                         || window.webkitRTCSessionDescription
                         || window.msRTCSessionDescription;


var PEER_CONNECTION_CONFIG = {
	iceServers: [
		{ url: 'stun:stun.services.mozilla.com' },
		{ url: 'stun:stun.l.google.com:19302' }
	]
};

function onErrorCallback(error) {
	console.error(error);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/**
 * @param {Socket} socket   - reference of the webSocket used to communicate to peer via connection server
 * @param {String} socketId - id of the peer on webSocket
 * @param {Object} info     - informations on this peer (name, etc.)
 */
Peer = function (socket, socketId, info) {
	EventEmitter.call(this);

	this.info           = info;     // peer info
	this.socket         = socket;   // reference to server webSocket
	this.socketId       = socketId; // id of this peer on webSocket
	this.peerConnection = null;     // RTCPeerConnection we have with this peer
	this.rtcDataChannel = null;     // RTC data channel with this peer
	this.isCaller       = true;     // is this peer the caller
	this.ready          = false;    // is peer RTC ready
}
inherits(Peer, EventEmitter);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Peer.prototype.startRTC = function () {
	var self = this;
	var pc = this._getRTC();
	this.isCaller = false;

	function gotDescription(description) {
		pc.setLocalDescription(description, function sendDescription() {
			self._sendSocketMessage({ sdp: description }); // Session Description Protocol
		}, onErrorCallback);
	}

	var channel = this.rtcDataChannel = pc.createDataChannel('sendDataChannel', { reliable: false });
	channel.onmessage = function(e){
		self._receiveRTCMessage(e.data);
	};
	pc.createOffer(gotDescription, onErrorCallback);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Peer.prototype.send = function (data) {
	if (!this.rtcDataChannel) return console.error('RTC data channel is not ready'); // TODO: use socket instead
	if (this.rtcDataChannel.readyState !== 'open') return this._rtcDisconnection();
	this.rtcDataChannel.send(JSON.stringify(data));
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Peer.prototype.receiveSocketMessage = function (data) {
	if (data.ice)   return this._getRTC().addIceCandidate(new RTCIceCandidate(data.ice));
	if (data.sdp)   return this._addSessionDescription(data.sdp);
	if (data.ready) return this._onRTCReady();
	// default
	console.log('>> UNHANDLED SOCKET MESSAGE from:', data.from, '>>>>', data.data);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Peer.prototype.lostSocketConnection = function () {
	// TODO
	this.socket = null;
	this.emit('disconnect');
	console.log('>> lost socket connection with peer', this.info);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Peer.prototype._onRTCReady = function () {
	if (!this.ready) this._sendSocketMessage({ ready: true });
	this.ready = true;
	this.emit('ready');
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Peer.prototype._receiveRTCMessage = function (data) {
	data = JSON.parse(data);
	if (data._type) this.emit(data._type, data);
	else this.emit('message', data);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Peer.prototype._rtcDisconnection = function () {
	// TODO
	this.peerConnection = null;
	this.rtcDataChannel = null;
	this.isCaller       = true;
	this.ready          = false;
	this.emit('disconnect');
	console.log('>> lost RTC connection with peer', this.info);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Peer.prototype._sendSocketMessage = function (data) {
	if (!this.socket) return console.error('No socket connection');
	data.to = this.socketId;
	this.socket.emit('message', data);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Peer.prototype._getRTC = function () {
	if (this.peerConnection) return this.peerConnection;

	var self = this;
	var pc = this.peerConnection = new RTCPeerConnection(PEER_CONNECTION_CONFIG, { optional: [{ RtpDataChannels: false }] });

	pc.onicecandidate = function gotIceCandidate(e) {
		if (e.candidate !== null) {
			self._sendSocketMessage({ ice: e.candidate });
		}
	};

	pc.ondatachannel = function (e) {
		var channel = self.rtcDataChannel = e.channel;
		channel.onmessage = function(e){
			self._receiveRTCMessage(e.data);
		};
	};

	return this.peerConnection;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Peer.prototype._addSessionDescription = function (sdp) {
	var self = this;
	var pc = this._getRTC();

	function gotDescription(description) {
		pc.setLocalDescription(description, function sendDescription() {
			self._sendSocketMessage({ sdp: description }); // Session Description Protocol
		}, onErrorCallback);
	}

	pc.setRemoteDescription(new RTCSessionDescription(sdp, 'offer'), function () {
		if (self.isCaller) {
			pc.createAnswer(gotDescription, onErrorCallback);
		} else {
			self._sendSocketMessage({ ready: true });
		}
	}, onErrorCallback);
};


})();
