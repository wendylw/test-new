import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useHistory } from 'react-router-dom';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { getMerchantBusiness } from '../../../../redux/modules/merchant/selectors';
import { getIsWeb } from '../../../../redux/modules/common/selectors';
import { getSource } from '../../redux/common/selectors';
import { getIsRedirectToSeamlessLoyalty, getIsRedirectToMembershipDetail } from './redux/selectors';
import { mounted } from './redux/thunks';

const SeamlessLoyaltyProxy = () => {
  const history = useHistory();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWeb = useSelector(getIsWeb);
  const source = useSelector(getSource);
  const isRedirectToSeamlessLoyalty = useSelector(getIsRedirectToSeamlessLoyalty);
  const isRedirectToMembershipDetail = useSelector(getIsRedirectToMembershipDetail);
  const seamlessLoyaltyURL = `${process.env.REACT_APP_MERCHANT_STORE_URL.replace(
    '%business%',
    merchantBusiness
  )}/loyalty/store-redemption`;
  const membershipDetailHistory = {
    path: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.MEMBERSHIP_DETAIL}`,
    search: `?business=${merchantBusiness}&source=${source}`,
  };

  useMount(() => {
    if (isWeb) {
      window.location.href = seamlessLoyaltyURL;
    } else {
      dispatch(mounted());
    }
  });

  // useEffect merchant disabled membership feature
  useEffect(() => {
    if (isRedirectToSeamlessLoyalty) {
      window.location.href = seamlessLoyaltyURL;
    }
  }, [isRedirectToSeamlessLoyalty]);

  // useEffect check if customer is member and enabled membership feature
  useEffect(() => {
    if (isRedirectToMembershipDetail) {
      history.push(membershipDetailHistory);
    }
  }, [isRedirectToMembershipDetail]);

  return <></>;
};

SeamlessLoyaltyProxy.displayName = 'SeamlessLoyaltyProxy';

export default SeamlessLoyaltyProxy;
