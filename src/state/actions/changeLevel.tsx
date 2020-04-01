import { IDoor } from "../../model/ILevel";

export default function changeLevel(level: string, through?: IDoor) {
  return {
    payload: { level, through },
    type: "LEVEL_CHANGE"
  };
}
