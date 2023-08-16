import React, { Component } from 'react';
import { Provider } from 'react-redux';
import App from './containers/App';
import { store } from './redux/store';

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
