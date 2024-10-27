import { gameStore, roomsStore, winnersStore } from '../stores';
import { randomUUID } from 'node:crypto';
import {
  CommandType,
  ShipData,
  GameIdentifier,
  GameStatus,
  Player,
  Position,
  UserIdentifier,
  SessionId,
} from '../types';
import { addShipToGameBoard, sendMessageToClient } from '../utils';
import { connectedClients } from '../ws_server';
import { userModel } from '../models/user';
import { BattleshipModel } from '../models/battleship';
import { botModel } from '../models/bot';
import WebSocket from 'ws';
import { singleplayerAttackHandler } from '../handlers/singleplayerAttackHandler';
import { multiplayerAttackHandler } from '../handlers/multiplayerAttackHandler';

export const createGameHandler = (roomId: string) => {
  const room = roomsStore.get(roomId);

  if (room?.roomUsers?.length === 2) {
    const users = room.roomUsers?.map((roomUser) =>
      userModel.getUser(roomUser?.index)
    );

    const allUsersExist = users?.every((u) => u?.id);
    if (allUsersExist) {
      const gameId = randomUUID();
      const players: Player[] = [];

      users.forEach((user) => {
        if (user) {
          const ws = connectedClients.get(user.sessionId);
          if (ws) {
            players.push({
              userId: user.id,
              ships: null,
              board: null,
            });

            sendMessageToClient(ws, {
              type: CommandType.CreateGame,
              data: {
                idGame: gameId,
                idPlayer: user.id,
              },
            });
          }
        }
      });

      gameStore.set(gameId, {
        gameId,
        players,
        currentPlayer: null,
        gameStatus: GameStatus.Created,
      });
      console.log(`The game has been successfully created with ID: ${gameId}.`);
    }
  }
};

export const addShipsHandler = (
  gameId: GameIdentifier,
  shipsData: ShipData[],
  userId: UserIdentifier
) => {
  const game = gameStore.get(gameId);
  if (!game) {
    console.error('Game not found!');
    return;
  }

  const gameBoard = new Map();
  const ships = shipsData.map((shipData) => {
    const ship = new BattleshipModel(shipData);
    addShipToGameBoard(gameBoard, ship);
    return ship;
  });

  const currentPlayerData: Player = {
    userId,
    ships,
    board: gameBoard,
  };

  gameStore.set(gameId, {
    ...game,
    players: game.players.map((player) =>
      player?.userId === userId ? currentPlayerData : player
    ),
  });
  console.log(
    `The user's ships have been added to the game store. Game ID: ${gameId}.`
  );
};

export const startGameHandler = (gameId: GameIdentifier) => {
  const game = gameStore.get(gameId);
  if (!game) {
    console.error('Game not found!');
    return;
  }

  const allPlayersAddedShips = game.players.every(
    (player) => player.ships?.length
  );

  if (allPlayersAddedShips) {
    const currentPlayerIndex = Math.floor(Math.random() * 2);
    const currentPlayer =
      game.players[currentPlayerIndex]?.userId! ?? game.players[0]?.userId;
    gameStore.set(gameId, {
      ...game,
      currentPlayer,
      gameStatus: GameStatus.InProgress,
    });

    game.players.forEach((player) => {
      const userData = userModel.getUser(player.userId)!;
      const ws = connectedClients.get(userData?.sessionId)!;

      sendMessageToClient(ws, {
        type: CommandType.StartGame,
        data: {
          gameId,
          indexPlayer: userData.id,
          ships: player.ships?.map(({ position, direction, length, type }) => ({
            position,
            direction,
            length,
            type,
          })),
        },
      });
      sendMessageToClient(ws, {
        type: CommandType.Turn,
        data: { currentPlayer: currentPlayer },
      });

      console.log(
        `The game with ID ${gameId} is now in progress. Current player: ${currentPlayer}.`
      );
    });
  }
};

export const handleSinglePlayGame = (ws: WebSocket, sessionId: SessionId) => {
  const user = userModel.findUserBySessionId(sessionId);
  if (!user) {
    console.error('User not found for single-play mode.');
    return;
  }
  const gameId = randomUUID();

  gameStore.set(gameId, {
    gameId,
    bot: botModel,
    players: [
      {
        userId: user.id,
        ships: null,
        board: null,
      },
    ],
    currentPlayer: user.id,
    gameStatus: GameStatus.Created,
  });

  sendMessageToClient(ws, {
    type: CommandType.CreateGame,
    data: {
      idGame: gameId,
      idPlayer: user.id,
    },
  });

  console.log(`The single game was created: ${gameId}`);
};

export const handleAttack = (
  gameId: GameIdentifier,
  shotPosition: Position,
  attackerId: UserIdentifier
) => {
  const game = gameStore.get(gameId);

  if (!game) {
    console.error(`Game with ID ${gameId} not found!`);
    return;
  }

  if (game.currentPlayer !== attackerId) {
    return;
  }

  const handleAttackMode = game.bot
    ? singleplayerAttackHandler
    : multiplayerAttackHandler;
  handleAttackMode(game.gameId, shotPosition, attackerId);
};
