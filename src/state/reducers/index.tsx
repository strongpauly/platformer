import {combineReducers} from 'redux';
import { levelReducer } from './level';
import { playerReducer } from './player';
export default combineReducers({
    level: levelReducer,
    player: playerReducer
});