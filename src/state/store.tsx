import {applyMiddleware, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import { IAction } from './actions/IAction';
import reducers from './reducers/';

const middlewares = [];
/* istanbul ignore if */
if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    predicate: (getState: any, action: IAction) => {
      return action.type.indexOf("UPDATE_ENEMY") === -1;
    }
  });
  middlewares.push(logger);
}

export default createStore(reducers, applyMiddleware(...middlewares));