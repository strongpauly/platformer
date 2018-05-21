import { IShape } from "../../components/IShape";
import { IAction } from "./IAction";

export default function collectGun(gun:IShape): IAction {
    return {
        payload: gun,
        type: 'COLLECT_GUN',
    };
  }
  