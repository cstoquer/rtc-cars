//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** @module peerManager
 *  @author Cedric Stoquer
 *
 */

var peerManager = window.peerManager = new EventEmitter();

(function () {

var socket = null;
var info   = null;
var peers  = {};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function registerNewClient(data) {
	var sessionId = socket.socket.sessionid;
	var peerId    = data.from;
	if (peerId === sessionId) return; // this is myself
	if (peers[peerId]) return; // this peer already have been registered
	var peer = peers[peerId] = new Peer(socket, peerId, data.info);
	peerManager.emit('newPeer', peer);
	// send back our info to this client
	socket.emit('message', { to: peerId, info: info });
}

function clientDisconnection(data) {
	// if (!data) return;
	var peerId = data.from;
	peers[peerId].lostSocketConnection();
	delete peers[peerId];
	// peerManager.emit('lostPeer', peerId);
}

function onPeerMessage(data) {
	var peerId = data.from;
	var peer   = peers[peerId];
	if (!peer) return console.error('Peer not registered ', peerId);
	peer.receiveSocketMessage(data);
}

function onMessage(data) {
	if (!data)     return console.warn('Received message without data');
	if (data.info) return registerNewClient(data);
	if (data.from) return onPeerMessage(data);
	console.warn('Received socket message without callee');
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
peerManager.init = function (inf, soc) {
	info   = inf;
	socket = soc;
	socket.on('message', onMessage);
	socket.on('disconnection', clientDisconnection);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
peerManager.getPeers = function () {
	return peers;
};


})();
