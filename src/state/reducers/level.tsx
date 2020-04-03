import * as _ from "lodash";
import { parse } from "qs";
import * as Constants from "../../components/Constants";
import { levels } from "../../levels";
import { IDoor, ILevel, ILevelMap } from "../../model/ILevel";
import { IPosition } from "../../model/IPosition";

interface ILevels {
  current: ILevel;
  levels: ILevelMap;
}

let startLevel = "1";
if (window && window.location) {
  const q = parse(window.location.search.substr(1));
  if (q && q.level) {
    startLevel = q.level;
  }
}

function initializeLevel(level: ILevel): ILevel {
  return {
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
}

export function levelReducer(
  level: ILevels = { current: levels[startLevel], levels: {} },
  action: any
) {
  switch (action.type) {
    case "LEVEL_CHANGE":
      const { to, from } = action.payload;
      if (!level.levels[to]) {
        level.levels[to] = initializeLevel(levels[to]);
      }
      level.levels[from] = level.current;
      level = {
        ...level,
        current: level.levels[to]
      };

      break;
    case "START":
      level.levels[startLevel] = initializeLevel(level.current);
      level = { ...level, current: level.levels[startLevel] };
      break;
    case "COLLECT_GUN":
      level = {
        ...level,
        current: {
          ...level.current,
          guns: level.current.guns.filter(
            (gun: IPosition) =>
              gun.x !== action.payload.x && gun.y !== action.payload.y
          )
        }
      };
      break;
    case "UPDATE_ENEMY":
      level = {
        ...level,
        current: {
          ...level.current,
          enemies: level.current.enemies.map((e: any) => {
            if (e.id === action.payload.id) {
              return action.payload;
            }
            return e;
          })
        }
      };
      break;
    case "KILL_ENEMY":
      level = {
        ...level,
        current: {
          ...level.current,
          enemies: level.current.enemies.filter(
            (e: any) => e.id !== action.payload.id
          )
        }
      };
      break;
    case "OPEN_DOOR":
      level = {
        ...level,
        current: {
          ...level.current,
          doors: level.current.doors.map((d: IDoor) => {
            if (d === action.payload) {
              action.payload.open = true;
            }
            return d;
          })
        }
      };
      break;
    default:
      break;
  }
  return level;
}
