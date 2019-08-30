import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducers from './reducers';

const store = createStore(
  rootReducers,
  compose(
    applyMiddleware(
      thunk,
    ),
    (func => (func ? func() : f => f))(window.__REDUX_DEVTOOLS_EXTENSION__),
  ),
);

export default store;
