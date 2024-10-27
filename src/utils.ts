import { randomUUID } from 'crypto';
import { Message, ClientMessage, SessionId } from './types';
import WebSocket from 'ws';
import { connectedClients } from './ws_server';
import { generateRoomUpdateMessage } from './controllers/room';

export const createSessionId = (): SessionId => {
  return `${randomUUID()}-${Date.now()}`;
};

export const parseClientMessage = (message: Message) => {
  return JSON.parse(message.data);
};

export const sendMessageToClient = (
  webSocket: WebSocket,
  clientMessage: ClientMessage
): void => {
  const formattedMessage = {
    ...clientMessage,
    data: JSON.stringify(clientMessage?.data),
    id: 0,
  };
  webSocket.send(JSON.stringify(formattedMessage));
};

export const sendMessageToAllClients = (data: string) => {
  for (const client of connectedClients.values()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
};

export const sendRoomInfoUpdate = () => {
  sendMessageToAllClients(generateRoomUpdateMessage());
};
