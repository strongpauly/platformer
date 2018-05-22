import * as Constants from '../../components/Constants';
import { IPlayer } from '../../model/IPlayer';
import { IAction } from "../actions/IAction";

const playerDefault = {
    falling: false,
    hasGun: false,
    height: Constants.PLAYER_HEIGHT,
    hp: 3,
    inverted: false,
    invulnerable: false,
    jumpStart: NaN,
    jumping: false,
    stepStart: NaN,
    stepping: false,
    width: Constants.PLAYER_WIDTH,
    x: 0,
    y: 0
};

export function playerReducer(player:IPlayer=playerDefault, action: IAction) {
    switch (action.type) {
        case 'START' :
        case 'LEVEL_CHANGE':
            player = {...playerDefault};
            break;
        case 'COLLECT_GUN' :
            player = {
                ...player,
                hasGun: true
            };
            break;
        case 'FALL_START': 
            player = {
                ...player,
                falling: true
            };
            break;
        case 'FALL_MOVE': 
            player = {
                ...player,
                falling: action.payload.falling,
                y: action.payload.y
            };
            break;
        case 'JUMP_START':
            player = {
                ...player,
                jumpStart: Date.now(),
                jumping: true,
            };
            break;
        case 'JUMP_MOVE':
            player = {
                ...player,
                jumping: action.payload.jumping,
                y: action.payload.y
            };
            break;
        case 'PLAYER_HIT':
            player = {
                ...player,
                hp: player.hp - 1,
                invulnerable: true
            }
            break;
        case 'PLAYER_VULNERABLE' :
            player = {
                ...player,
                invulnerable: false
            }
            break;
        case 'STEP_START':
            player = {
                ...player,
                inverted: action.payload,
                stepStart: Date.now(),
                stepping: true,
            };
            break;
        case 'STEP_MOVE':
            player = {
                ...player,
                stepping: action.payload.stepping,
                x: action.payload.x
            };
            break;    
        case 'STEP_STOP':
            player = {
                ...player,
                stepping: false,
            };
            break;    
        default :
            break;    
    }
    return player;
}