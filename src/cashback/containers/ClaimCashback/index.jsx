import React from 'react';
import Frame from '../../../common/components/Frame';
import PageHeader from '../../../common/components/PageHeader';
import MerchantInfo from './components/MerchantInfo';
import CashbackBlock from './components/CashbackBlock';

const ClaimCashback = () => {
  return (
    <Frame>
      <PageHeader />
      <MerchantInfo />
      <CashbackBlock />
    </Frame>
  );
};

ClaimCashback.displayName = 'ClaimCashback';

export default ClaimCashback;
