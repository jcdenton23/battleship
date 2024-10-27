import { registerUser } from '../controllers/registration';
import { createNewRoom } from '../controllers/room';
import { Message, SessionId } from '../types';
import { parseClientMessage, sendRoomInfoUpdate } from '../utils';
import WebSocket from 'ws';

export const processRegistration = (
  ws: WebSocket,
  currentSessionId: SessionId,
  message: Message
) => {
  registerUser(ws, currentSessionId, parseClientMessage(message));
  sendRoomInfoUpdate();
};

export const processRoomCreation = (currentSessionId: SessionId) => {
  createNewRoom(currentSessionId);
  sendRoomInfoUpdate();
};
