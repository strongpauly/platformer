import { IPosition } from "./IPosition";
import { IShape } from "./IShape";

export interface IDoor extends IPosition {
  open?: boolean;
  to: string;
}

interface IInitializedDoor extends IShape, IDoor {}

export interface IEnemy extends IPosition {
  hp: number;
  speed: number;
  maxX: number;
  minX: number;
}

export interface IInitializedEnemy extends IShape, IEnemy {
  movementInterval?: number;
}

export interface IGun extends IPosition {
  bullets?: number;
}

interface IInitializedGun extends IShape, IGun {}

export interface ILevel {
  doors: IDoor[];
  enemies: IEnemy[];
  guns: IGun[];
  name: string;
  platforms: IShape[];
  width: number;
}

export interface IInitializedLevel extends ILevel {
  doors: IInitializedDoor[];
  enemies: IInitializedEnemy[];
  guns: IInitializedGun[];
}

export interface ILevelMap {
  [levelName: string]: ILevel;
}
