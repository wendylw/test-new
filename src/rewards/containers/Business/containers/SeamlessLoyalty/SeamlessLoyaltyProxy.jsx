import React from 'react';
import { useSelector } from 'react-redux';
import { getMerchantBusiness } from '../../../../../../common/selectors';

const SeamlessLoyaltyProxy = () => {
  const merchantBusiness = useSelector(getMerchantBusiness);
  // get IsWeb
  // Member Business (for seamless loyalty page, ${business}${process.env.REACT_APP_MERCHANT_STORE_URL}/loyalty/store-redemption)
};

SeamlessLoyaltyProxy.displayName = 'SeamlessLoyaltyProxy';

export default SeamlessLoyaltyProxy;
