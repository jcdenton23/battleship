import { userModel } from '../models/user';
import { gameStore, winnersStore } from '../stores';
import {
  AttackStatus,
  CommandType,
  GameIdentifier,
  GameStatus,
  Position,
  UserIdentifier,
} from '../types';
import { sendAdjacentAttackCoordinates, sendToAllPlayers } from '../utils';

export const multiplayerAttackHandler = (
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

  console.log(
    `Attack by ${attackerId} on game ${gameId} at position (${x}, ${y}): ${attackStatus}`
  );

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

    console.log(`Game ${gameId} finished, The winner is: ${attackerId}`);

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
