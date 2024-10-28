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
  console.log(`New user created: ${name} (ID: ${id})`);
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
  if (error) {
    console.log(`Registration failed for ${name}: ${errorText}`);
  } else {
    console.log(`Registration successful for ${name} (ID: ${userId})`);
  }
};

export const registerUser = (
  ws: WebSocket,
  sessionId: SessionId,
  data: RegistrationData
): void => {
  const { name, password } = data;

  console.log(`Registration attempt for user: ${name}`);
  const existingUser = userModel.findUserByName(name);

  if (!existingUser) {
    const userId = createUser(name, password, sessionId);
    sendRegistrationResponse(ws, name, userId);
    return;
  }

  console.log(`User ${name} already exists. Attempting authentication...`);

  const isAuthenticated = userModel.authenticateUser(name, password);
  if (isAuthenticated) {
    const userId = userModel.updateUserSession(name, sessionId)!;
    sendRegistrationResponse(ws, name, userId);
    return;
  }
  console.log(`Authentication failed for user: ${name}. Incorrect password.`);
  sendRegistrationResponse(ws, name, '0', true, 'The password is incorrect.');
};
