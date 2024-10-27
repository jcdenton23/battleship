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

export interface Winner {
  name: UserName;
  wins: number;
}

export type ClientMessage = Message<object>;
export type SessionId = string;
export type UserIdentifier = string;
export type UserName = string;
