import { ShipData, ShipType } from './types';

export const BOARD_SIZE = 10;
export const DIRECTIONS = [-1, 0, 1];

export const shipsData: Array<ShipData[]> = [
  [
    {
      position: { x: 4, y: 2 },
      direction: true,
      type: ShipType.Huge,
      length: 4,
    },
    {
      position: { x: 1, y: 2 },
      direction: true,
      type: ShipType.Large,
      length: 3,
    },
    {
      position: { x: 6, y: 3 },
      direction: false,
      type: ShipType.Large,
      length: 3,
    },
    {
      position: { x: 9, y: 0 },
      direction: true,
      type: ShipType.Medium,
      length: 2,
    },
    {
      position: { x: 7, y: 0 },
      direction: true,
      type: ShipType.Medium,
      length: 2,
    },
    {
      position: { x: 3, y: 7 },
      direction: true,
      type: ShipType.Medium,
      length: 2,
    },
    {
      position: { x: 7, y: 5 },
      direction: false,
      type: ShipType.Small,
      length: 1,
    },
    {
      position: { x: 5, y: 0 },
      direction: true,
      type: ShipType.Small,
      length: 1,
    },
    {
      position: { x: 9, y: 5 },
      direction: true,
      type: ShipType.Small,
      length: 1,
    },
    {
      position: { x: 0, y: 9 },
      direction: false,
      type: ShipType.Small,
      length: 1,
    },
  ],
  [
    {
      position: { x: 3, y: 0 },
      direction: true,
      type: ShipType.Huge,
      length: 4,
    },
    {
      position: { x: 6, y: 7 },
      direction: false,
      type: ShipType.Large,
      length: 3,
    },
    {
      position: { x: 4, y: 6 },
      direction: true,
      type: ShipType.Large,
      length: 3,
    },
    {
      position: { x: 0, y: 2 },
      direction: false,
      type: ShipType.Medium,
      length: 2,
    },
    {
      position: { x: 5, y: 0 },
      direction: true,
      type: ShipType.Medium,
      length: 2,
    },
    {
      position: { x: 7, y: 2 },
      direction: false,
      type: ShipType.Medium,
      length: 2,
    },
    {
      position: { x: 1, y: 0 },
      direction: true,
      type: ShipType.Small,
      length: 1,
    },
    {
      position: { x: 5, y: 3 },
      direction: true,
      type: ShipType.Small,
      length: 1,
    },
    {
      position: { x: 0, y: 9 },
      direction: false,
      type: ShipType.Small,
      length: 1,
    },
    {
      position: { x: 0, y: 4 },
      direction: false,
      type: ShipType.Small,
      length: 1,
    },
  ],
  [
    {
      position: { x: 2, y: 1 },
      direction: true,
      type: ShipType.Huge,
      length: 4,
    },
    {
      position: { x: 3, y: 6 },
      direction: false,
      type: ShipType.Large,
      length: 3,
    },
    {
      position: { x: 7, y: 7 },
      direction: false,
      type: ShipType.Large,
      length: 3,
    },
    {
      position: { x: 7, y: 2 },
      direction: false,
      type: ShipType.Medium,
      length: 2,
    },
    {
      position: { x: 6, y: 9 },
      direction: false,
      type: ShipType.Medium,
      length: 2,
    },
    {
      position: { x: 0, y: 6 },
      direction: false,
      type: ShipType.Medium,
      length: 2,
    },
    {
      position: { x: 0, y: 3 },
      direction: false,
      type: ShipType.Small,
      length: 1,
    },
    {
      position: { x: 8, y: 4 },
      direction: false,
      type: ShipType.Small,
      length: 1,
    },
    {
      position: { x: 4, y: 3 },
      direction: false,
      type: ShipType.Small,
      length: 1,
    },
    {
      position: { x: 0, y: 0 },
      direction: true,
      type: ShipType.Small,
      length: 1,
    },
  ],
];
