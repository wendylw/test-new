import React from 'react';
import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';
import thunk from 'redux-thunk';
import rootReducers from './reducers';
import { Provider } from 'react-redux';
import './App.scss';
import Routes from './Routes';

const store = createStore(
  rootReducers,
  compose(
    applyMiddleware(
      thunk,
    ),
    (func => (func ? func() : f => f))(window.__REDUX_DEVTOOLS_EXTENSION__),
  ),
);

// Pages
function App() {
  return (
    <Provider store={store}>
      <Routes />
    </Provider>
  );
}

export default App;
