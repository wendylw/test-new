import React, { Component } from 'react';
import ErrorPage from '../../../components/Error';
import Utils from '../../../utils/utils';
import NativeHeader from '../../../components/NativeHeader';

export class Error extends Component {
  render() {
    return (
      <>
        {Utils.isWebview() && <NativeHeader />}
        <ErrorPage data-test-id="cashback.error-page.container"></ErrorPage>
      </>
    );
  }
}

Error.displayName = 'CashbackError';

export default Error;
