import React from 'react';
import { useSelector } from 'react-redux';
import { getMerchantDisplayName } from '../../../../../../redux/modules/merchant/selectors';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';

const MemberCard = () => {
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const customerMembershipLevelName = useSelector(getCustomerTierLevelName);

  return (
    <div>
      <div>{merchantDisplayName}</div>
      <div>{customerMembershipLevelName}</div>
    </div>
  );
};

MemberCard.displayName = 'MemberCard';

export default MemberCard;
