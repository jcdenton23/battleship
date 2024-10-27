import {
  addShipsHandler,
  attackHandler,
  createGameHandler,
  startGameHandler,
} from '../controllers/game';
import { registerUser } from '../controllers/registration';
import { addUserToExistingRoom, createNewRoom } from '../controllers/room';
import { gameStore } from '../stores';
import { GameStatus, Message, SessionId } from '../types';
import {
  parseClientMessage,
  sendRoomInfoUpdate,
  sendWinnersUpdate,
} from '../utils';
import WebSocket from 'ws';

export const processRegistration = (
  ws: WebSocket,
  currentSessionId: SessionId,
  message: Message
) => {
  registerUser(ws, currentSessionId, parseClientMessage(message));
  sendRoomInfoUpdate();
  sendWinnersUpdate();
};

export const processRoomCreation = (currentSessionId: SessionId) => {
  createNewRoom(currentSessionId);
  sendRoomInfoUpdate();
};

export const processUserJoiningRoom = (
  currentSessionId: SessionId,
  message: Message
) => {
  const clientData = parseClientMessage(message);
  addUserToExistingRoom(currentSessionId, clientData?.indexRoom);
  createGameHandler(clientData?.indexRoom);
  sendRoomInfoUpdate();
};

export const processShipAddition = (message: Message) => {
  const { gameId, ships, indexPlayer } = parseClientMessage(message);
  if (!gameId || !ships || !indexPlayer) {
    console.log('Invalid data for adding ships');
    return;
  }
  addShipsHandler(gameId, ships, indexPlayer);
  startGameHandler(gameId);
};

export const processPlayerAttack = (message: Message) => {
  const { gameId, x = 0, y = 0, indexPlayer } = parseClientMessage(message);
  if (!gameId || !indexPlayer) {
    console.log('Invalid data for attack');
    return;
  }
  attackHandler(gameId, { x, y }, indexPlayer);
  const game = gameStore.get(gameId);
  if (game && game.gameStatus === GameStatus.Complete && game.winnerId) {
    sendWinnersUpdate();
  }
};
