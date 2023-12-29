import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useHistory } from 'react-router-dom';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { getMerchantBusiness, getIsMerchantEnabledMembership } from '../../../../redux/modules/merchant/selectors';
import { getIsWeb } from '../../../../redux/modules/common/selectors';
import { getSource } from '../../redux/common/selectors';
import { getIsAllInitialRequestsCompleted } from './redux/selectors';
import { mounted } from './redux/thunks';

const SeamlessLoyaltyProxy = () => {
  const history = useHistory();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWeb = useSelector(getIsWeb);
  const source = useSelector(getSource);
  const isMerchantEnabledMembership = useSelector(getIsMerchantEnabledMembership);
  const isAllInitialRequestsCompleted = useSelector(getIsAllInitialRequestsCompleted);
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

  useEffect(() => {
    if (isAllInitialRequestsCompleted) {
      isMerchantEnabledMembership ? history.push(membershipDetailHistory) : (window.location.href = seamlessLoyaltyURL);
    }
  }, [isAllInitialRequestsCompleted]);

  return <div>loader</div>;
};

SeamlessLoyaltyProxy.displayName = 'SeamlessLoyaltyProxy';

export default SeamlessLoyaltyProxy;
