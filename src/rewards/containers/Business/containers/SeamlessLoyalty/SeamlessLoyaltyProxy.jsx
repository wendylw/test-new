import React from 'react';
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useHistory } from 'react-router-dom';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { getMerchantBusiness } from '../../../../redux/modules/merchant/selectors';
import { getIsWeb } from '../../../../redux/modules/common/selectors';
import { getSource } from './redux/selectors';
import { mounted } from './redux/thunks';

const SeamlessLoyaltyProxy = () => {
  const history = useHistory();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWeb = useSelector(getIsWeb);
  const source = useSelector(getSource);
  const seamlessLoyaltyURL = `${process.env.REACT_APP_MERCHANT_STORE_URL.replace(
    '%business%',
    merchantBusiness
  )}/loyalty/store-redemption`;
  const joinMemberHistory = {
    path: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.JOIN_MEMBERSHIP}`,
    search: `?business=${merchantBusiness}&source=${source}`,
  };
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

  // TODO: useEffect merchant disabled membership feature
  // if (!enabledMembership) {
  //   window.location.href = seamlessLoyaltyURL;
  // }

  // TODO: useEffect check if customer is not member and merchant enabled membership feature
  // if (!isMember && enabledMembership) {
  //   history.push(joinMemberHistory)
  // }

  // TODO: useEffect check if customer is member and enabled membership feature
  // if (isMember && enabledMembership) {
  //   history.push(membershipDetailHistory)
  // }

  return <></>;
};

SeamlessLoyaltyProxy.displayName = 'SeamlessLoyaltyProxy';

export default SeamlessLoyaltyProxy;
