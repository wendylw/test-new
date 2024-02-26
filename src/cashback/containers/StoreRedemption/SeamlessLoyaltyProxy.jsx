import React from 'react';
import { useSelector } from 'react-redux';
import { getIsWeb } from '../../redux/modules/common/selectors';
import SeamlessLoyaltyWeb from './SeamlessLoyaltyWeb';
import SeamlessLoyaltyNative from './index';
import '../../../common/styles/base.scss';

const SeamlessLoyaltyProxy = () => {
  const isWeb = useSelector(getIsWeb);

  return isWeb ? <SeamlessLoyaltyWeb /> : <SeamlessLoyaltyNative />;
};

SeamlessLoyaltyProxy.displayName = 'SeamlessLoyaltyProxy';

export default SeamlessLoyaltyProxy;
