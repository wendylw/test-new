import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './modules';
import apiGql from '../../redux/middlewares/apiGql';
import api from '../../redux/middlewares/api';

const store = (() => {
  if (
    process.env.NODE_ENV !== 'production' &&
    // eslint-disable-next-line no-underscore-dangle
    window.__REDUX_DEVTOOLS_EXTENSION__
  ) {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    return createStore(rootReducer, composeEnhancers(applyMiddleware(thunk, apiGql, api)));
  }

  return createStore(rootReducer, applyMiddleware(thunk, apiGql, api));
})();

export default store;
