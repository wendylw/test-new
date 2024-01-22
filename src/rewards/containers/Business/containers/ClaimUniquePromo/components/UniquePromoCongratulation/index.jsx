import React from 'react';
import { useSelector } from 'react-redux';
import SmartIframe from '../../../../../../../common/components/SmartIframe';
import { getUniquePromosCongratulationUrl } from '../../redux/selectors';
import styles from './UniquePromoRewards.module.scss';

const UniquePromoCongratulation = () => {
  const iframeUrl = useSelector(getUniquePromosCongratulationUrl);

  return (
    <div className={styles.uniquePromosRewards}>
      <SmartIframe id="claim-unique-promo-congratulation" title="Claim Unique Promo Congratulation" src={iframeUrl} />
    </div>
  );
};

UniquePromoCongratulation.displayName = 'UniquePromoCongratulation';

export default UniquePromoCongratulation;
