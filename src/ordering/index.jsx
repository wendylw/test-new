import React from 'react';
import { Provider } from 'react-redux';
import App from './containers/App';
import { store } from './redux/store';

const Index = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

Index.displayName = 'OrderingIndex';

export default Index;
