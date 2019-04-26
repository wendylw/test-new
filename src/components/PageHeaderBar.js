import React from 'react';
import { compose } from 'react-apollo';
import withOnlineStoreInfo from '../libs/withOnlineStoreInfo';

const PageHeaderBar = ({ gqlOnlineStoreInfo, sessionId, config }) => {
  const { onlineStoreInfo } = gqlOnlineStoreInfo;

  console.log('sessionId => %o', sessionId);

  if (!onlineStoreInfo) {
    return null;
  }

  const { logo, storeName } = onlineStoreInfo;

  return (
    <div>
      <img src={logo} alt="STORE_LOGO" />
      <span>{storeName}</span>
      |
      <span>Table #{config.table}</span>
      <hr />
    </div>
  );
};

// `compose` reference: https://www.apollographql.com/docs/react/api/react-apollo#compose
export default compose(
  withOnlineStoreInfo,
)(PageHeaderBar);
