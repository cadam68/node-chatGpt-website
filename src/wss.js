const WebSocket = require('ws');

let wss;
let connections = {};
let connectionIDCounter = 1;

const init = (port) => {
    console.log(`Start WebSocket on port ${port}`)
    wss = new WebSocket.Server({ port });
    wss.on('connection', function(ws) {
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


