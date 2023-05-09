import React from 'react';
import RedemptionStoreInfo from './components/RedemptionStoreInfo';
import CashbackBlock from './components/CashbackBlock';
import styles from './StoreRedemption.module.scss';

const StoreRedemption = () => (
  <div className={styles.StoreRedemption}>
    <RedemptionStoreInfo />
    <section>
      <CashbackBlock />
    </section>
  </div>
);

StoreRedemption.displayName = 'StoreRedemption';

export default StoreRedemption;
