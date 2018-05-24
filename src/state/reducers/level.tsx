import * as _ from "lodash";
import * as Constants from '../../components/Constants';
import { IPosition } from '../../components/IPosition';
import { levels }  from '../../levels';

export function levelReducer(level:any=levels['1'], action:any) {
    switch (action.type) {
        case 'LEVEL_CHANGE':
            level = _.cloneDeep(levels[action.payload]);
        case 'START' :
            level = {
                ...level,
                enemies: level.enemies.map((enemy: any, index:number) => ({
                    ...enemy,
                    height: Constants.ENEMY_HEIGHT,
                    id: level.name + '_' + index,
                    width: Constants.ENEMY_WIDTH,
                }))
            };
            break;
        case 'COLLECT_GUN':
            level = {
                ...level,
                guns: level.guns.filter((gun: IPosition) => gun.x !== action.payload.x && gun.y !== action.payload.y)
            }
            break;
        case 'UPDATE_ENEMY':
            level = {
                ...level,
                enemies: level.enemies.map( (e:any) => {
                    if(e.id === action.payload.id) {
                        return action.payload;
                    }
                    return e;
                })
            }
            break;
        case 'KILL_ENEMY': 
            level = {
                ...level,
                enemies: level.enemies.filter( (e:any) => e.id !== action.payload.id)
            }
            break;
        case 'OPEN_DOOR':
            level = {
                ...level,
                door: level.doors.map( (d:any) => {
                    if(d.x === action.payload.x && d.y === action.payload.y) {
                        action.payload.open = true;
                        return action.payload;
                    }
                    return d;
                })
            }
            break;
        default :
            break;    
    }
    return level;
}