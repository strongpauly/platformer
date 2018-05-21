import {combineReducers} from 'redux';
import {enemiesReducer} from './enemies';
import { playerReducer } from './player';
export default combineReducers({
    enemies: enemiesReducer,
    player: playerReducer
});