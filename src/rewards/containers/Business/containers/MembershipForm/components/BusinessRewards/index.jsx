import React from 'react';
import { useSelector } from 'react-redux';
import SmartIframe from '../../../../../../../common/components/SmartIframe';
import { getBusinessRewardsUrl } from '../../redux/selectors';
import styles from './BusinessRewards.module.scss';

const BusinessRewards = () => {
  const iframeUrl = useSelector(getBusinessRewardsUrl);

  return (
    <div className={styles.businessRewards}>
      <SmartIframe id="join-membership-rewards" title="Join Membership Rewards" src={iframeUrl} defaultHeight={302} />
    </div>
  );
};

BusinessRewards.displayName = 'BusinessRewards';

export default BusinessRewards;
