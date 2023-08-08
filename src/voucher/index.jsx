import React from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import store from './redux/store';
import App from './containers/App';

const Voucher = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

Voucher.displayName = 'Voucher';

export default withRouter(Voucher);
