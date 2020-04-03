import { IAction } from "./IAction";

export default function fireGun(bullets: number = 1): IAction {
  return {
    payload: bullets,
    type: "FIRE_GUN"
  };
}
