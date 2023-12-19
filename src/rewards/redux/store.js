import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';
import createRootReducer from './modules';
import api from '../../redux/middlewares/api';
import apiGql from '../../redux/middlewares/apiGql';
import requestPromise from '../../redux/middlewares/requestPromise';
import history from '../rewardsHistory';

// eslint-disable-next-line no-underscore-dangle
const isEnableReduxDevTools = process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__;
const reduxDevToolsComposeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

const composeEnhancers = isEnableReduxDevTools ? reduxDevToolsComposeEnhancer : compose;

export default function configureStore(preloadedState) {
  const store = createStore(
    createRootReducer(history), // root reducer with router state
    preloadedState,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history), // for dispatching history actions
        thunk,
        apiGql,
        api,
        requestPromise
      )
    )
  );

  return store;
}

export const store = configureStore(/* provide initial state if any */);
