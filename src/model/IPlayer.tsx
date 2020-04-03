import { IShape } from "./IShape";

export interface IPlayer extends IShape {
  bullets: number;
  falling: boolean;
  hasGun: boolean;
  hp: number;
  inverted: boolean;
  invulnerable: boolean;
  jumpPercent: number;
  jumping: boolean;
  score: number;
  stepStart: number;
  stepping: boolean;
}
