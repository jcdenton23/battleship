import { randomUUID } from 'crypto';
import { Message, ClientMessage, SessionId, CommandType } from './types';
import WebSocket from 'ws';

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
