import React from 'react';
import { useSelector } from 'react-redux';
import { getMerchantBusiness } from '../../../../redux/modules/merchant/selectors';
import { getIsWeb } from '../../../../redux/modules/common/selectors';

const SeamlessLoyaltyProxy = () => {
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWeb = useSelector(getIsWeb);
  const seamlessLoyaltyURL = `${process.env.REACT_APP_MERCHANT_STORE_URL.replace(
    '%business%',
    merchantBusiness
  )}/loyalty/store-redemption`;
  // get IsWeb
  // Member Business (for seamless loyalty page, ${business}${process.env.REACT_APP_MERCHANT_STORE_URL}/loyalty/store-redemption)
};

SeamlessLoyaltyProxy.displayName = 'SeamlessLoyaltyProxy';

export default SeamlessLoyaltyProxy;
