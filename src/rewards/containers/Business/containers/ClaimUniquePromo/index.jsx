import React from 'react';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';

const ClaimUniquePromo = () => {
  const { t } = useTranslation(['Rewards']);

  console.log('ClaimUniquePromo', t);

  return (
    <Frame>
      <PageHeader title="ClaimUniquePromoPageTitle" />
    </Frame>
  );
};

ClaimUniquePromo.displayName = 'ClaimUniquePromo';

export default ClaimUniquePromo;
