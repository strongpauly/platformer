import { IAction } from "./IAction";

export default function updateEnemy(enemy:any): IAction {
    return {
        payload: enemy,
        type: 'UPDATE_ENEMY',
    };
  }