import { IDoor } from "../../model/ILevel";
import { IAction } from "./IAction";

export type LevelChangeAction = IAction<{
  to: string;
  from: string;
  through?: IDoor;
}>;

export default function changeLevel(to: string, from: string, through?: IDoor) {
  return {
    payload: { to, from, through },
    type: "LEVEL_CHANGE"
  };
}
