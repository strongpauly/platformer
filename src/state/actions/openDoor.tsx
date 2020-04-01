import { IDoor } from "../../model/ILevel";

export default function openDoor(door: IDoor) {
  return {
    payload: door,
    type: "OPEN_DOOR"
  };
}
