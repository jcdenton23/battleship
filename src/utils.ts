import { randomUUID } from 'crypto';
import { Message, ClientMessage, SessionId, CommandType } from './types';
import WebSocket from 'ws';
import { BattleshipModel } from './models/battleship';
import { connectedClients } from './ws_server';
import { winnersStore } from './stores';
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

const calculateShipCoordinates = (
  x: number,
  y: number,
  length: number,
  direction: boolean
): string[] => {
  const coordinates: string[] = [];

  for (let i = 0; i < length; i++) {
    const key = direction ? `${x}:${y + i}` : `${x + i}:${y}`;
    coordinates.push(key);
  }

  return coordinates;
};

export const addShipToGameBoard = (
  gameBoard: Map<string, BattleshipModel>,
  ship: BattleshipModel
): void => {
  const { x, y } = ship.position;
  const shipCoordinates = calculateShipCoordinates(
    x,
    y,
    ship.length,
    ship.direction
  );

  shipCoordinates.forEach((coordinate) => {
    gameBoard.set(coordinate, ship);
  });
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

export const sendWinnersUpdate = () => {
  const winners = Array.from(winnersStore.values())?.sort(
    (winner1, winner2) => winner2?.wins - winner1?.wins
  );
  const data = JSON.stringify({
    type: CommandType.UpdateWinners,
    data: JSON.stringify(winners),
    id: 0,
  });
  sendMessageToAllClients(data);
};
