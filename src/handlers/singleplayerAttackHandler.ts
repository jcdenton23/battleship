import { BattleshipModel } from '../models/battleship';
import { gameStore } from '../stores';
import {
  AttackStatus,
  CommandType,
  GameIdentifier,
  GameStatus,
  Position,
  UserIdentifier,
} from '../types';
import { getAdjacentPositions, sendToAllPlayers } from '../utils';

export const singleplayerAttackHandler = (
  gameId: GameIdentifier,
  shotPosition: Position,
  attackerId: UserIdentifier
) => {
  const game = gameStore.get(gameId);
  if (!game) {
    console.error('Game not found!');
    return;
  }

  const battleshipBot = game.bot;
  if (!battleshipBot) {
    console.error('The bot has not been created! Game id: ', game.gameId);
    return;
  }

  const { x, y } = shotPosition;
  const attackKey = `${x}:${y}`;
  const ship = battleshipBot.board?.get(attackKey);

  const handleAttackResult = (
    targetPosition: Position,
    currentPlayer: UserIdentifier,
    status: AttackStatus
  ) => {
    sendToAllPlayers(game, {
      type: CommandType.Attack,
      data: {
        position: targetPosition,
        currentPlayer,
        status,
      },
    });
  };

  const checkVictory = (isWinCondition: boolean, winnerId: UserIdentifier) => {
    if (isWinCondition) {
      sendToAllPlayers(game, {
        type: CommandType.Finish,
        data: { winPlayer: winnerId },
      });
      gameStore.set(gameId, {
        ...game,
        gameStatus: GameStatus.Complete,
        winnerId,
      });
      console.log(`Game ${gameId} finished. Winner: ${winnerId}`);
    }
  };

  const handleShipSunk = (
    sunkShip: BattleshipModel,
    currentPlayer: UserIdentifier
  ) => {
    const shipSurroundingCoordinates = getAdjacentPositions(sunkShip);
    shipSurroundingCoordinates.forEach((coordinate) =>
      handleAttackResult(coordinate, currentPlayer, AttackStatus.Miss)
    );
  };

  if (ship && ship.registerHit(x, y)) {
    const attackStatus = ship.checkSunkStatus()
      ? AttackStatus.Killed
      : AttackStatus.Shot;

    if (attackStatus === AttackStatus.Killed) {
      handleShipSunk(ship, attackerId);
    }

    handleAttackResult(shotPosition, attackerId, attackStatus);

    const isPlayerWin = battleshipBot.ships?.every((s) => s.checkSunkStatus());
    checkVictory(isPlayerWin, attackerId);
  } else {
    handleAttackResult(
      shotPosition,
      attackerId,
      ship ? AttackStatus.Shot : AttackStatus.Miss
    );

    sendToAllPlayers(game, {
      type: CommandType.Turn,
      data: { currentPlayer: battleshipBot.botId },
    });

    const playerData = game.players[0]!;
    let battleshipBotTurn = true;

    while (battleshipBotTurn) {
      const battleshipBotShotPosition = battleshipBot.generateRandomShot();
      const shotKey = `${battleshipBotShotPosition.x}:${battleshipBotShotPosition.y}`;
      const playerShip = playerData.board?.get(shotKey);

      if (
        playerShip &&
        playerShip.registerHit(
          battleshipBotShotPosition.x,
          battleshipBotShotPosition.y
        )
      ) {
        const attackStatus = playerShip.checkSunkStatus()
          ? AttackStatus.Killed
          : AttackStatus.Shot;

        if (attackStatus === AttackStatus.Killed) {
          handleShipSunk(playerShip, battleshipBot.botId);
        }

        handleAttackResult(
          battleshipBotShotPosition,
          battleshipBot.botId,
          attackStatus
        );

        const isBotWin = playerData.ships?.every((s) => s.checkSunkStatus())!;
        checkVictory(isBotWin, battleshipBot.botId);
      } else {
        handleAttackResult(
          battleshipBotShotPosition,
          battleshipBot.botId,
          AttackStatus.Miss
        );

        sendToAllPlayers(game, {
          type: CommandType.Turn,
          data: { currentPlayer: attackerId },
        });
        battleshipBotTurn = false;
      }
    }
  }
};
