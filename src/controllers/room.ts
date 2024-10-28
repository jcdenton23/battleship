import { randomUUID } from 'node:crypto';
import { roomsStore } from '../stores';
import { SessionId, Room, CommandType } from '../types';
import { userModel } from '../models/user';

const getCurrentUser = (sessionId: SessionId) => {
  const currentUser = userModel.findUserBySessionId(sessionId);
  if (!currentUser) {
    console.error('Error: User does not exist. Please log in.');
  } else {
    console.log(
      `Current user retrieved: ${currentUser.name} (ID: ${currentUser.id})`
    );
  }
  return currentUser;
};

const filterAvailableRooms = () => {
  const availableRooms = Array.from(roomsStore.values()).filter(
    (room) => room?.roomUsers?.length <= 1
  );
  console.log(`Available rooms filtered. Count: ${availableRooms.length}`);
  return availableRooms;
};

export const generateRoomUpdateMessage = () => {
  const roomsData = filterAvailableRooms();
  return JSON.stringify({
    type: CommandType.UpdateRoom,
    data: JSON.stringify(roomsData),
    id: 0,
  });
};

export const createNewRoom = (sessionId: SessionId) => {
  const currentUser = getCurrentUser(sessionId);
  if (!currentUser) return;

  const roomId = randomUUID();
  const newRoom: Room = {
    roomId,
    roomUsers: [{ name: currentUser.name, index: currentUser.id }],
  };

  roomsStore.set(roomId, newRoom);
  console.log(
    `Room created successfully: ${roomId} by user: ${currentUser.name}`
  );
};

export const addUserToExistingRoom = (sessionId: SessionId, roomId: string) => {
  console.log(`Attempting to add user to room: ${roomId}`);
  const room = roomsStore.get(roomId);
  if (!room) {
    console.error('Error: Room not found. Please check the room ID.');
    return;
  }

  const currentUser = getCurrentUser(sessionId);
  if (!currentUser) return;

  const userAlreadyInRoom = room.roomUsers.some(
    (roomUser) => roomUser.index === currentUser.id
  );

  if (userAlreadyInRoom) {
    console.error('Error: You are already in this room.');
    return;
  }

  const newRoomData: Room = {
    ...room,
    roomUsers: [
      ...room.roomUsers,
      { name: currentUser.name, index: currentUser.id },
    ],
  };

  roomsStore.set(roomId, newRoomData);
  console.log(`User ${currentUser.name} added to room ${roomId}.`);
};
