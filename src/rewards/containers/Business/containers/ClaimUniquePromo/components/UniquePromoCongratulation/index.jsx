import React from 'react';
import { useSelector } from 'react-redux';
import SmartIframe from '../../../../../../../common/components/SmartIframe';
import { getUniquePromosCongratulationUrl } from '../../redux/selectors';
import styles from './UniquePromoCongratulation.module.scss';

const UniquePromoCongratulation = () => {
  const iframeUrl = useSelector(getUniquePromosCongratulationUrl);

  return (
    <div className={styles.UniquePromoCongratulation}>
      <SmartIframe
        id="claim-unique-promo-congratulation"
        title="Claim Unique Promo Congratulation"
        src={iframeUrl}
        defaultHeight={600}
      />
    </div>
  );
};

UniquePromoCongratulation.displayName = 'UniquePromoCongratulation';

export default UniquePromoCongratulation;
