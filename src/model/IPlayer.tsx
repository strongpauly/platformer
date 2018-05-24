import { IShape } from "../components/IShape";

export interface IPlayer extends IShape {
    falling: boolean;
    hasGun: boolean;
    hp: number;
    inverted: boolean;
    invulnerable: boolean;
    jumpPercent: number;
    jumping: boolean;
    stepStart: number;
    stepping: boolean;
}
