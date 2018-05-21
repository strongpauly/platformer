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
        case 'STEP_START':
            player = {
                ...player,
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