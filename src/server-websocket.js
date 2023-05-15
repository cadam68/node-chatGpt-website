const WebSocket = require('ws');

let serverWebsocket;
let connections = {};
let connectionIDCounter = 1;

const init = (httpServer) => {
    serverWebsocket = new WebSocket.Server({server: httpServer});
    serverWebsocket.on('connection', function(ws) {
        console.log('Client connecté');
        ws.id = connectionIDCounter ++;
        connections[ws.id] = ws;
        ws.send(JSON.stringify({ type: 'id', id: ws.id }));
        ws.on("close", () => {
            console.log("Client ["+ws.id+"] disconnected");
            delete connections[ws.id];
        });
    });
}

const getWs = (wsId) => {
    return wsId?connections[wsId]:undefined;
}

module.exports = { init, getWs };


