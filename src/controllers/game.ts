import { gameStore, roomsStore, winnersStore } from '../stores';
import { randomUUID } from 'node:crypto';
import {
  CommandType,
  AttackStatus,
  ShipData,
  GameIdentifier,
  GameStatus,
  Player,
  Position,
  UserIdentifier,
} from '../types';
import {
  addShipToGameBoard,
  sendMessageToClient,
  sendAdjacentAttackCoordinates,
  sendToAllPlayers,
} from '../utils';
import { connectedClients } from '../ws_server';
import { userModel } from '../models/user';
import { BattleshipModel } from '../models/battleship';

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
    const currentPlayer = game.players[currentPlayerIndex]?.userId!;
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
        data: { currentPlayer },
      });
    });
  }
};

export const attackHandler = (
  gameId: GameIdentifier,
  shotPosition: Position,
  attackerId: UserIdentifier
) => {
  const game = gameStore.get(gameId);
  if (!game) {
    console.error('Game not found!');
    return;
  }

  if (game.currentPlayer !== attackerId) {
    return;
  }

  let nextCurrentPlayer: UserIdentifier = attackerId;
  let attackStatus = AttackStatus.Miss;
  const opponentData = game.players.find(
    (player) => player.userId !== attackerId
  )!;
  const { x, y } = shotPosition;
  const attackKey = `${x}:${y}`;
  const ship = opponentData.board?.get(attackKey);

  if (ship) {
    const isHit = ship.registerHit(x, y);
    if (!isHit) {
      return;
    }

    attackStatus = AttackStatus.Shot;
    if (ship.checkSunkStatus()) {
      attackStatus = AttackStatus.Killed;
      sendAdjacentAttackCoordinates(game, ship, attackerId);
    }
  } else {
    nextCurrentPlayer = opponentData.userId;
  }

  sendToAllPlayers(game, {
    type: CommandType.Attack,
    data: {
      position: shotPosition,
      currentPlayer: attackerId,
      status: attackStatus,
    },
  });

  const gameFinished = opponentData?.ships?.every((ship) =>
    ship.checkSunkStatus()
  );

  if (gameFinished) {
    sendToAllPlayers(game, {
      type: CommandType.Finish,
      data: {
        winPlayer: attackerId,
      },
    });
    gameStore.set(gameId, {
      ...game,
      gameStatus: GameStatus.Complete,
      winnerId: attackerId,
    });

    if (winnersStore.has(attackerId)) {
      const winnerData = winnersStore.get(attackerId)!;
      const wins = winnerData?.wins + 1;
      winnersStore.set(attackerId, { ...winnerData, wins });
    } else {
      const winner = userModel.getUser(attackerId)!;
      winnersStore.set(attackerId, { name: winner?.name, wins: 1 });
    }
  } else {
    gameStore.set(gameId, { ...game, currentPlayer: nextCurrentPlayer });
    sendToAllPlayers(game, {
      type: CommandType.Turn,
      data: { currentPlayer: nextCurrentPlayer },
    });
  }
};
