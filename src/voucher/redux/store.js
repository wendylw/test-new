import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './modules';
import api from '../../redux/middlewares/api';
import apiGql from '../../redux/middlewares/apiGql';
import requestPromise from '../../redux/middlewares/requestPromise';

let store;

if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk, apiGql, api, requestPromise)));
} else {
  store = createStore(rootReducer, applyMiddleware(thunk, apiGql, api, requestPromise));
}

if (process.env.NODE_ENV !== 'production') {
  console.warn('window.store is available in console now for debug');
  window.store = store;
}

export default store;
