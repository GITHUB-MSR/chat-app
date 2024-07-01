// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

const authenticatedUsers = {};

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            switch (data.type) {
                case 'auth':
                    handleAuthentication(data, ws);
                    break;
                case 'message':
                    handleChatMessage(data, ws);
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function handleAuthentication(data, ws) {
    const { name, securityCode } = data;
    if (securityCode === '1234') {
        authenticatedUsers[ws] = { name };
        ws.send(JSON.stringify({ type: 'auth_success' }));
    } else {
        ws.send(JSON.stringify({ type: 'auth_failure', message: 'Invalid security code' }));
    }
}

function handleChatMessage(data, ws) {
    const { message } = data;
    wss.clients.forEach((client) => {
        if (client !== ws && authenticatedUsers[client]) {
            client.send(JSON.stringify({ type: 'message', name: authenticatedUsers[ws].name, message }));
        }
    });
}
