import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';
import { BUILD_NODE_ENV } from '../../common/utils/constants';
import history from '../utils/history';
import createRootReducer from './modules';

export const configureStore = preloadedState => {
  /* eslint-disable no-underscore-dangle */
  const isEnableReduxDevTools = process.env.NODE_ENV !== BUILD_NODE_ENV && window.__REDUX_DEVTOOLS_EXTENSION__;
  /* eslint-enable no-underscore-dangle */
  const composeEnhancers = isEnableReduxDevTools ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;
  const store = createStore(
    createRootReducer(history), // root reducer with router state
    preloadedState,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history), // for dispatching history actions
        thunk
      )
    )
  );

  return store;
};

export default configureStore();
