import WebSocket, { WebSocketServer } from 'ws';
import { createSessionId } from '../utils';
import { wsMessageHandler } from '../handlers/wsMessagesHandler';

const WEBSOCKET_PORT = 3000;

export const connectedClients = new Map<string, WebSocket>();

const handleConnection = (ws: WebSocket) => {
  const currentSessionId = createSessionId();
  connectedClients.set(currentSessionId, ws);
  ws.on('message', wsMessageHandler(ws, currentSessionId));
  ws.on('close', () => {
    connectedClients.delete(currentSessionId);
    console.log(`Client disconnected: ${currentSessionId}`);
  });
};

export const webSocketServer = () => {
  const wss = new WebSocketServer({
    port: WEBSOCKET_PORT,
  });
  wss.on('connection', handleConnection);
  console.log('Start websocket on port ', WEBSOCKET_PORT);
};
