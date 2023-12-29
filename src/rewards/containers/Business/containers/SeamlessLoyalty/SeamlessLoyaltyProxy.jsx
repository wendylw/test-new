import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
// import { getIsMerchantEnabledMembership } from '../../../../redux/modules/merchant/selectors';
import { getIsAllInitialRequestsCompleted } from './redux/selectors';

const SeamlessLoyaltyProxy = () => {
  // const isMerchantEnabledMembership = useSelector(getIsMerchantEnabledMembership);
  const isAllInitialRequestsCompleted = useSelector(getIsAllInitialRequestsCompleted);

  useEffect(() => {
    if (isAllInitialRequestsCompleted) {
      // TODO: isMerchantEnabledMembership is true to redirect to MembershipDetail, otherwise redirect to SeamlessLoyalty
    }
  }, [isAllInitialRequestsCompleted]);

  return !isAllInitialRequestsCompleted && <div>loader</div>;
};

SeamlessLoyaltyProxy.displayName = 'SeamlessLoyaltyProxy';

export default SeamlessLoyaltyProxy;
