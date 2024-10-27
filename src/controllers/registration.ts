import { randomUUID } from 'node:crypto';
import WebSocket from 'ws';
import { CommandType, RegistrationData, SessionId, User } from '../types';
import { sendMessageToClient } from '../utils';
import { userModel } from '../models/user';

const createUser = (
  name: string,
  password: string,
  sessionId: SessionId
): string => {
  const id = randomUUID();
  const user: User = { id, name, password, sessionId };
  userModel.addUser(id, user);
  return id;
};

const sendRegistrationResponse = (
  ws: WebSocket,
  name: string,
  userId: string,
  error: boolean = false,
  errorText: string = ''
): void => {
  sendMessageToClient(ws, {
    type: CommandType.Register,
    data: {
      name,
      index: userId,
      error,
      errorText,
    },
  });
};

export const registerUser = (
  ws: WebSocket,
  sessionId: SessionId,
  data: RegistrationData
): void => {
  const { name, password } = data;

  const existingUser = userModel.findUserByName(name);

  if (!existingUser) {
    const userId = createUser(name, password, sessionId);
    sendRegistrationResponse(ws, name, userId);
    return;
  }

  const isAuthenticated = userModel.authenticateUser(name, password);
  if (isAuthenticated) {
    const userId = userModel.updateUserSession(name, sessionId)!;
    sendRegistrationResponse(ws, name, userId);
    return;
  }

  sendRegistrationResponse(ws, name, '0', true, 'The password is incorrect.');
};
