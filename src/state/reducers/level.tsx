import * as _ from "lodash";
import { parse } from "qs";
import * as Constants from "../../components/Constants";
import { IPosition } from "../../components/IPosition";
import { levels } from "../../levels";
import { IDoor, ILevel } from "../../model/ILevel";

export function levelReducer(level: ILevel = levels["1"], action: any) {
  switch (action.type) {
    case "LEVEL_CHANGE":
      level = _.cloneDeep(levels[action.payload.level]);
    case "START":
      level = {
        ...level,
        doors: level.doors.map((door: any, index: number) => ({
          ...door,
          height: Constants.DOOR_HEIGHT,
          id: level.name + "_" + index,
          width: Constants.DOOR_WIDTH
        })),
        enemies: level.enemies.map((enemy: any, index: number) => ({
          ...enemy,
          height: Constants.ENEMY_HEIGHT,
          id: level.name + "_" + index,
          width: Constants.ENEMY_WIDTH
        }))
      };
      if (window && window.location) {
        const q = parse(window.location.search.substr(1));
        if (q && q.level) {
          level = _.cloneDeep(levels[q.level]);
        }
      }
      break;
    case "COLLECT_GUN":
      level = {
        ...level,
        guns: level.guns.filter(
          (gun: IPosition) =>
            gun.x !== action.payload.x && gun.y !== action.payload.y
        )
      };
      break;
    case "UPDATE_ENEMY":
      level = {
        ...level,
        enemies: level.enemies.map((e: any) => {
          if (e.id === action.payload.id) {
            return action.payload;
          }
          return e;
        })
      };
      break;
    case "KILL_ENEMY":
      level = {
        ...level,
        enemies: level.enemies.filter((e: any) => e.id !== action.payload.id)
      };
      break;
    case "OPEN_DOOR":
      level = {
        ...level,
        doors: level.doors.map((d: IDoor) => {
          if (d === action.payload) {
            action.payload.open = true;
          }
          return d;
        })
      };
      break;
    default:
      break;
  }
  return level;
}
