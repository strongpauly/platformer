import * as Constants from "../../components/Constants";
import { levels } from "../../levels";
import { IPlayer } from "../../model/IPlayer";
import { LevelChangeAction } from "../actions/changeLevel";
import { IAction } from "../actions/IAction";

const playerDefault = {
  bullets: 0,
  falling: false,
  hasGun: false,
  height: Constants.PLAYER_HEIGHT,
  hp: 3,
  inverted: false,
  invulnerable: false,
  jumpPercent: NaN,
  jumping: false,
  score: 0,
  stepStart: NaN,
  stepping: false,
  width: Constants.PLAYER_WIDTH,
  x: 25,
  y: 0
};

export function playerReducer(
  player: IPlayer = playerDefault,
  action: IAction
) {
  switch (action.type) {
    case "START":
      player = { ...playerDefault };
      break;
    case "LEVEL_CHANGE":
      let { x } = playerDefault;
      const levelChangeAction = action as LevelChangeAction;
      if (levelChangeAction.payload.through) {
        const toLevel = levels[levelChangeAction.payload.to];
        const fromDoor = toLevel.doors.find(
          door => door.to === levelChangeAction.payload.from
        );
        console.log(fromDoor);
        if (fromDoor) {
          x = fromDoor.x + (player.inverted ? -player.width : player.width);
        }
      }
      player = { ...player, x };
      break;
    case "COLLECT_GUN":
      player = {
        ...player,
        bullets: player.bullets + (action.payload.bullets || 20),
        hasGun: true
      };
      break;
    case "FIRE_GUN":
      const newBullets = player.bullets - action.payload;
      player = {
        ...player,
        bullets: newBullets < 0 ? 0 : newBullets,
        hasGun: newBullets > 0
      };
      break;
    case "FALL_START":
      player = {
        ...player,
        falling: true
      };
      break;
    case "FALL_MOVE":
      player = {
        ...player,
        falling: action.payload.falling,
        y: action.payload.y
      };
      break;
    case "JUMP_START":
      player = {
        ...player,
        jumpPercent: 0,
        jumping: true
      };
      break;
    case "JUMP_MOVE":
      player = {
        ...player,
        jumpPercent: action.payload.jumpPercent,
        jumping: action.payload.jumping,
        y: action.payload.y
      };
      break;
    case "PLAYER_HIT":
      player = {
        ...player,
        hp: player.hp - 1,
        invulnerable: true
      };
      break;
    case "PLAYER_VULNERABLE":
      player = {
        ...player,
        invulnerable: false
      };
      break;
    case "STEP_START":
      player = {
        ...player,
        inverted: action.payload,
        stepStart: Date.now(),
        stepping: true
      };
      break;
    case "STEP_MOVE":
      player = {
        ...player,
        stepping: action.payload.stepping,
        x: action.payload.x
      };
      break;
    case "STEP_STOP":
      player = {
        ...player,
        stepping: false
      };
      break;
    case "KILL_ENEMY": {
      player = {
        ...player,
        score: player.score + 100
      };
    }
    default:
      break;
  }
  return player;
}
