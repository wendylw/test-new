import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createRootReducer from './modules';
import api from '../../redux/middlewares/api';
import apiGql from '../../redux/middlewares/apiGql';
import requestPromise from '../../redux/middlewares/requestPromise';
import { routerMiddleware } from 'connected-react-router';
import history from '../orderingHistory';

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
