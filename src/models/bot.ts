import { randomUUID } from 'crypto';
import { addShipToGameBoard, createRandomPositions } from '../utils';
import { BattleshipModel } from './battleship';
import { shipsData } from '../constants';

export class Bot {
  private static instance: Bot;

  public botId: string;
  public ships: BattleshipModel[];
  public board: Map<string, BattleshipModel>;

  private constructor(botId: string) {
    this.botId = botId;
    this.ships = [];
    this.board = new Map();
    this.initializeShips();
  }

  public static getInstance(botId: string): Bot {
    if (!Bot.instance) {
      Bot.instance = new Bot(botId);
    }
    return Bot.instance;
  }

  private initializeShips(): void {
    const shipsIndex = Math.floor(Math.random() * shipsData.length);
    this.ships = shipsData[shipsIndex].map((shipData) => {
      const ship = new BattleshipModel(shipData);
      this.addShipToBoard(ship);
      return ship;
    });
  }

  private addShipToBoard(ship: BattleshipModel): void {
    addShipToGameBoard(this.board, ship);
  }

  public generateRandomShot(): { x: number; y: number } {
    return createRandomPositions();
  }
}

export const botModel = Bot.getInstance(`bot-${randomUUID()}`);
