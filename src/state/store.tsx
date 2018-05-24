import {applyMiddleware, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import { IAction } from './actions/IAction';
import reducers from './reducers/';

const middlewares:any[] = [];
/* istanbul ignore if */
if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    predicate: (getState: any, action: IAction) => {
      return action.type.indexOf("UPDATE_ENEMY") === -1;
    }
  });
  middlewares.push(logger);
}

export function createPlatformerStore() {
  return createStore(reducers, applyMiddleware(...middlewares));
}

export default createPlatformerStore();