import {combineReducers} from 'redux';
import {enemiesReducer} from './enemies';
export default combineReducers({
    enemies: enemiesReducer
});