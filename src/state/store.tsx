import {applyMiddleware, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import reducers from './reducers/';

const middlewares = [];
/* istanbul ignore if */
if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    // ...options
  });
  middlewares.push(logger);
}

export default createStore(reducers, applyMiddleware(...middlewares));