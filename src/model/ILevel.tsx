export interface IPosition {
  x: number;
  y: number;
}

export interface IBox extends IPosition {
  width: number;
  height: number;
}

export interface IDoor extends IPosition {
  open?: boolean;
  to: string;
}

export interface IEnemy extends IPosition {
  hp: number;
  speed: number;
  maxX: number;
  minX: number;
}

export interface ILevel {
  doors: IDoor[];
  enemies: IEnemy[];
  guns: IPosition[];
  name: string;
  platforms?: IBox[];
  width: number;
}

export interface ILevelMap {
  [levelName: string]: ILevel;
}
