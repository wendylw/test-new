import React from 'react';
import { E_INVOICE_APP_CONTAINER_ID } from '../../utils/constants';
import Routes from '../Routes';
import '../../../common/styles/base.scss';
import './App.scss';

const App = () => (
  <main id={E_INVOICE_APP_CONTAINER_ID} data-test-id="e-invoice.app.container">
    <Routes />
  </main>
);

App.displayName = 'EInvoiceApp';

export default App;
