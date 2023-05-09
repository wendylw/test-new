import React from 'react';
import { useSelector } from 'react-redux';
import { getStoreLogo, getStoreDisplayTitle } from '../../redux/selectors';

const RedemptionStoreInfo = () => {
  // get store logo
  const storeLogo = useSelector(getStoreLogo);
  // get store display title, storeBrandName || onlineStoreName
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);

  return (
    <section>
      {storeLogo}
      {storeDisplayTitle}
    </section>
  );
};

RedemptionStoreInfo.displayName = 'StoreInfoBanner';

export default RedemptionStoreInfo;
