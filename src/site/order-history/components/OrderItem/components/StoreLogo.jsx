/* eslint-disable react/prop-types */
import React from 'react';
import PlaceHolderStoreLogo from '../../../../../images/placeholder-store-logo.png';

function StoreLogo({ url, storeName }) {
  return (
    <figure className="order-history__store-logo logo margin-smaller">
      <img alt={storeName} src={url || PlaceHolderStoreLogo} />
    </figure>
  );
}

StoreLogo.displayName = 'StoreLogo';

export default StoreLogo;
