import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMembershipDetailNewDesign } from './redux/selectors';
import MembershipDetailV2 from '../MembershipDetailV2';
import MembershipDetail from './index';

const MembershipDetailProxy = () => {
  const isMembershipDetailNewDesign = useSelector(getIsMembershipDetailNewDesign);

  return isMembershipDetailNewDesign ? <MembershipDetailV2 /> : <MembershipDetail />;
};

MembershipDetailProxy.displayName = 'MembershipDetailProxy';

export default MembershipDetailProxy;
