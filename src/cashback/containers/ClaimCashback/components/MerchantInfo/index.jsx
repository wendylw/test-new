import React from 'react';
import { useSelector } from 'react-redux';
import { getOnlineStoreInfoLogo, getBusinessDisplayName } from '../../../../redux/modules/app';
import { getOrderCashbackStoreCity } from '../../../../redux/modules/claim';
import { ObjectFitImage } from '../../../../../common/components/Image';

const MerchantInfo = () => {
  const merchantLogo = useSelector(getOnlineStoreInfoLogo);
  const merchantDisplayName = useSelector(getBusinessDisplayName);
  const city = useSelector(getOrderCashbackStoreCity);

  return (
    <section>
      <div>
        <ObjectFitImage className="tw-rounded" src={merchantLogo} />
      </div>
      <h1>
        {merchantDisplayName}
        {city ? `, ${city}` : ''}
      </h1>
    </section>
  );
};

MerchantInfo.displayName = 'MerchantInfo';

export default MerchantInfo;
