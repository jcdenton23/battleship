import { randomUUID } from 'crypto';
import {
  Message,
  ClientMessage,
  SessionId,
  CommandType,
  Position,
  Game,
  AttackStatus,
} from './types';
import WebSocket from 'ws';
import { BattleshipModel } from './models/battleship';
import { connectedClients } from './ws_server';
import { winnersStore } from './stores';
import { generateRoomUpdateMessage } from './controllers/room';
import { userModel } from './models/user';
import { BOARD_SIZE, DIRECTIONS } from './constants';

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

export const sendToAllPlayers = (game: Game, message: ClientMessage) => {
  game.players.forEach(({ userId }) => {
    const userData = userModel.getUser(userId)!;
    const ws = connectedClients.get(userData?.sessionId)!;

    sendMessageToClient(ws, message);
  });
};

const isValidPosition = (
  x: number,
  y: number,
  shipCoords: Position[]
): boolean => {
  const isWithinBounds = x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  const isOccupied = shipCoords.some(
    (shipPosition) => shipPosition.x === x && shipPosition.y === y
  );
  return isWithinBounds && !isOccupied;
};

export const getAdjacentPositions = (ship: BattleshipModel): Position[] => {
  const adjacentPositions = new Map<string, Position>();
  const { position, length, direction } = ship;
  const shipCoordinates: Position[] = [];

  for (let i = 0; i < length; i++) {
    const coordinate: Position = direction
      ? { x: position.x, y: position.y + i }
      : { x: position.x + i, y: position.y };
    shipCoordinates.push(coordinate);
  }

  shipCoordinates.forEach(({ x, y }) => {
    for (const dx of DIRECTIONS) {
      for (const dy of DIRECTIONS) {
        const newX = x + dx;
        const newY = y + dy;

        if (isValidPosition(newX, newY, shipCoordinates)) {
          const key = `${newX}:${newY}`;
          if (!adjacentPositions.has(key)) {
            adjacentPositions.set(key, { x: newX, y: newY });
          }
        }
      }
    }
  });

  return Array.from(adjacentPositions.values());
};

export const sendAdjacentAttackCoordinates = (
  game: Game,
  ship: BattleshipModel,
  attackerId: string
) => {
  const adjacentCoordinates = getAdjacentPositions(ship);

  adjacentCoordinates.forEach((coordinate) => {
    sendToAllPlayers(game, {
      type: CommandType.Attack,
      data: {
        position: coordinate,
        currentPlayer: attackerId,
        status: AttackStatus.Miss,
      },
    });
  });
};
