var express = require('express');
var http    = require('http');
var io      = require('socket.io');

var app = express();

app.set('port',  process.env.PORT || 3000);

app.use(express.favicon());
app.use('/', express.static(process.cwd() + '/www'));


//█████████████████████████████████████████████
//█████████████████████████████████████████████
//█▀▄▄▄▄ █▀▄▄▄▄▀█▄ ▀▄▄▄█▄ ▄██▄ ▄█▀▄▄▄▄▀█▄ ▀▄▄▄█
//██▄▄▄▄▀█ ▄▄▄▄▄██ ███████ ██ ███ ▄▄▄▄▄██ █████
//█ ▀▀▀▀▄█▄▀▀▀▀▀█▀ ▀▀▀█████  ████▄▀▀▀▀▀█▀ ▀▀▀██
//█████████████████████████████████████████████

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});


//████████████████████████████████████████████████████
//████████████████████▄░████████████▀████████▄████████
//██▀▄▄▄░█▀▄▄▄▀█▀▄▄▀░██░█▄░▄█▀▄▄▄▀█▄░▄▄█████▄░██▀▄▄▄▀█
//███▄▄▄▀█░███░█░██████░▄░███░▄▄▄▄██░████████░██░███░█
//██░▀▀▀▄█▄▀▀▀▄█▄▀▀▀▄█▀░██░▀█▄▀▀▀▀██▄▀▀▄█░░█▀░▀█▄▀▀▀▄█
//████████████████████████████████████████████████████
var sockets = {};

var sock = io.listen(server);
sock.set('log level', 1);

sock.sockets.on('connection', function (socket) {
	// adding socket in pool
	var clientId = socket.id;
	sockets[clientId] = socket;

	// broadcast
	socket.on('broadcast', function (data) {
		// TODO: we can use broadcast function available in socket.io
		data = data || {};
		if (!data.from) data.from = clientId;
		for (var id in sockets) {
			sockets[id].emit('message', data);
		}
	});

	// simple message
	socket.on('message', function (data) {
		data = data || {};
		destination = sockets[data.to];
		if (!destination) return console.log('No client with socket id ' + data.to);
		if (!data.from) data.from = clientId;
		destination.emit('message', data);
	});

	// TODO: disconnection
	socket.on('disconnect', function () {
		delete sockets[clientId];
		for (var id in sockets) {
			sockets[id].emit('disconnection', { from: clientId });
		}
	});
});
