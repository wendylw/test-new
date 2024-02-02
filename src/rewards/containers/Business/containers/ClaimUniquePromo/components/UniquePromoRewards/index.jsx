import React from 'react';
import { useSelector } from 'react-redux';
import SmartIframe from '../../../../../../../common/components/SmartIframe';
import { getUniquePromosRewardsUrl } from '../../redux/selectors';
import styles from './UniquePromoRewards.module.scss';

const UniquePromoRewards = () => {
  const iframeUrl = useSelector(getUniquePromosRewardsUrl);

  return (
    <div className={styles.UniquePromosRewards}>
      <SmartIframe allowFullScreen id="claim-unique-promo-rewards" title="Claim Unique Promo Rewards" src={iframeUrl} />
    </div>
  );
};

UniquePromoRewards.displayName = 'UniquePromoRewards';

export default UniquePromoRewards;
