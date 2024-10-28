import { BattleshipModel } from './models/battleship';
import { Bot } from './models/bot';

export enum CommandType {
  Register = 'reg',
  UpdateWinners = 'update_winners',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  CreateGame = 'create_game',
  UpdateRoom = 'update_room',
  AddShips = 'add_ships',
  StartGame = 'start_game',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
  Turn = 'turn',
  Finish = 'finish',
  SinglePlay = 'single_play',
}

export enum ShipType {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Huge = 'huge',
}

export enum AttackStatus {
  Miss = 'miss',
  Killed = 'killed',
  Shot = 'shot',
}

export enum GameStatus {
  Created = 'created',
  InProgress = 'inProgress',
  Complete = 'complete',
}

export interface RegistrationData {
  name: string;
  password: string;
}

export interface Command {
  type: CommandType;
}

export interface Message<T = string> extends Command {
  data: T;
}

export interface User {
  id: UserIdentifier;
  name: UserName;
  password: string;
  sessionId: SessionId;
}

export interface RoomUser {
  name: UserName;
  index: UserIdentifier;
}

export interface Room {
  roomId: number | string;
  roomUsers: RoomUser[];
}

export interface Position {
  x: number;
  y: number;
}

export interface ShipData {
  position: Position;
  direction: boolean;
  type: ShipType;
  length: number;
}

export interface Player {
  userId: UserIdentifier;
  ships: BattleshipModel[] | null;
  board: Map<string, BattleshipModel> | null;
}

export interface Game {
  bot?: Bot | null;
  gameId: GameIdentifier;
  players: Player[];
  currentPlayer: UserIdentifier | null;
  gameStatus: GameStatus;
  winnerId?: UserIdentifier;
}

export interface Winner {
  name: UserName;
  wins: number;
}

export type ClientMessage = Message<object>;
export type SessionId = string;
export type UserIdentifier = string;
export type UserName = string;
export type GameIdentifier = string | number;
