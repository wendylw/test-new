import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useHistory } from 'react-router-dom';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { getMerchantBusiness } from '../../../../redux/modules/merchant/selectors';
import { getIsWeb } from '../../../../redux/modules/common/selectors';
import { getSource, getIsMember } from './redux/selectors';
import { mounted } from './redux/thunks';

const SeamlessLoyaltyProxy = () => {
  const history = useHistory();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWeb = useSelector(getIsWeb);
  const source = useSelector(getSource);
  const isMember = useSelector(getIsMember);
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
  // useEffect(() => {
  // if (!enabledMembership) {
  //   window.location.href = seamlessLoyaltyURL;
  // }
  // }, [enabledMembership]);

  // TODO: useEffect check if customer is not member and merchant enabled membership feature
  // useEffect(() => {
  // if (!isMember && enabledMembership) {
  //   history.push(joinMemberHistory)
  // }
  // }, [isMember, enabledMembership]);

  // TODO: useEffect check if customer is member and enabled membership feature
  // useEffect(() => {
  // if (isMember && enabledMembership) {
  //   history.push(membershipDetailHistory)
  // }
  // }, [isMember, enabledMembership]);

  return <></>;
};

SeamlessLoyaltyProxy.displayName = 'SeamlessLoyaltyProxy';

export default SeamlessLoyaltyProxy;
