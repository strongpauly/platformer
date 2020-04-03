import { IGun } from "../../model/ILevel";
import { IAction } from "./IAction";

export default function collectGun(gun: IGun): IAction<IGun> {
  return {
    payload: gun,
    type: "COLLECT_GUN"
  };
}
