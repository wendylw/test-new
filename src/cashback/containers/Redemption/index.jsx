import React from 'react';
import Frame from '../../../common/components/Frame';
import StoreInfoBanner from './components/StoreInfoBanner';
import CashbackBlock from './components/CashbackBlock';

const Redemption = () => {
  const storeName = 'test';
  return (
    <Frame>
      <StoreInfoBanner storeName={storeName} />
      <section>
        <CashbackBlock />
      </section>
    </Frame>
  );
};

Redemption.displayName = 'Redemption';

export default Redemption;
