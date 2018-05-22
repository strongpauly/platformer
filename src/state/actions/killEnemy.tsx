import { IAction } from "./IAction";

export default function killEnemy(enemy:any): IAction {
    return {
        payload: enemy,
        type: 'KILL_ENEMY',
    };
  }