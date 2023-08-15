import React from 'react';
import ErrorPage from '../../../components/Error';
import Utils from '../../../utils/utils';
import NativeHeader from '../../../components/NativeHeader';

const Error = () => (
  <>
    {Utils.isWebview() && <NativeHeader />}
    <ErrorPage data-test-id="cashback.error-page.container" />
  </>
);

Error.displayName = 'CashbackError';

export default Error;
