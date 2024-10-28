import { ShipData, Position, ShipType } from '../types';

export class BattleshipModel {
  public type: ShipType;
  public position: Position;
  public direction: boolean;
  public length: number;

  private hitCount: number = 0;
  private registeredHits: Set<string> = new Set();

  constructor(ship: ShipData) {
    this.type = ship.type;
    this.position = ship.position;
    this.direction = ship.direction;
    this.length = ship.length;
  }

  public checkSunkStatus(): boolean {
    return this.hitCount === this.length;
  }

  private createPositionKey(x: number | string, y: number | string): string {
    return `${x}:${y}`;
  }

  public registerHit(x: number | string, y: number | string): boolean {
    const key = this.createPositionKey(x, y);
    if (this.registeredHits.has(key)) return false;
    this.registeredHits.add(key);
    this.hitCount++;
    return true;
  }
}
