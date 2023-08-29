import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './modules';
import api from '../../redux/middlewares/api';
import apiGql from '../../redux/middlewares/apiGql';
import requestPromise from '../../redux/middlewares/requestPromise';

const store = (() => {
  // eslint-disable-next-line no-underscore-dangle
  if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    return createStore(rootReducer, composeEnhancers(applyMiddleware(thunk, apiGql, api, requestPromise)));
  }

  return createStore(rootReducer, applyMiddleware(thunk, apiGql, api, requestPromise));
})();

if (process.env.NODE_ENV !== 'production') {
  window.store = store;
}

export default store;
