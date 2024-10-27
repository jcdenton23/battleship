import { registerUser } from '../controllers/registration';
import { Message, SessionId } from '../types';
import { parseClientMessage } from '../utils';
import WebSocket from 'ws';

export const processRegistration = (
  ws: WebSocket,
  currentSessionId: SessionId,
  message: Message
) => {
  registerUser(ws, currentSessionId, parseClientMessage(message));
};
