import WebSocket from 'ws';
import { CommandType, Message, SessionId } from '../types';
import {
  processRegistration,
  processRoomCreation,
} from './gameMessageHandlers';

export const wsMessageHandler =
  (ws: WebSocket, currentSessionId: SessionId) =>
  (rawData: WebSocket.RawData) => {
    try {
      const message: Message = JSON.parse(rawData.toString());
      console.log(`Received command "${message?.type}"`);

      switch (message?.type) {
        case CommandType.Register:
          processRegistration(ws, currentSessionId, message);
          break;
        case CommandType.CreateRoom:
          processRoomCreation(currentSessionId);
          break;
        default:
          console.log(`Unknown command type: ${message?.type}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };
