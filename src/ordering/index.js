import React, { Component } from 'react';
import { Provider } from 'react-redux';
import App from './containers/App';
import configureStore from './redux/store';

const store = configureStore(/* provide initial state if any */);
class Index extends Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}
Index.displayName = 'OrderingIndex';

export default Index;
