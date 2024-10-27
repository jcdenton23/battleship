import { Game, GameIdentifier, Room, UserIdentifier, Winner } from '../types';

export const gameStore = new Map<GameIdentifier, Game>();
export const roomsStore = new Map<string, Room>();
export const winnersStore = new Map<UserIdentifier, Winner>([]);
