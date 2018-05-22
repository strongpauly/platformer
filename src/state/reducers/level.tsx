import * as Constants from '../../components/Constants';
import { IPosition } from '../../components/IPosition';
import { levels }  from '../../levels';

export function levelReducer(level:any=null, action:any) {
    if(level === null) {
        level = levels['1'];
    }
    switch (action.type) {
        case 'START' :
            level = {
                ...level,
                enemies: level.enemies.map( (enemy: any, index:number) => {
                    enemy.id = index;
                    enemy.width = Constants.ENEMY_WIDTH;
                    enemy.height = Constants.ENEMY_HEIGHT;
                    return enemy;
                }),
            }
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
        case 'LEVEL_CHANGE':
            level = levels[action.payload];
        default :
            break;    
    }
    return level;
}