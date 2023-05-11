import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from '../../../../../common/components/Image';
import StoreRDMCashback from '../../../../../images/store-rdm-cashback.svg';

const CashbackBlock = () => {
  const { t } = useTranslation('Cashback');

  return (
    <div className="tw-bg-gray-50 tw-rounded-xl tw-shadow">
      <h2 className="tw-flex tw-items-center tw-px-8 sm:tw-px-8px tw-py-12 sm:tw-py-12px tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
        <Image className="tw-m-4 sm:tw-m-4px" noCompression src={StoreRDMCashback} alt="StoreHub Cashback" />
        <span className="tw-m-4 sm:tw-m-4px tw-text-xl tw-leading-loose tw-font-bold">{t('Cashback')}</span>
      </h2>
      <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-16 sm:tw-p-16px">
        <h4 className="tw-my-2 sm:tw-my-2px tw-leading-loose">{t('StoreRedemptionCashbackDescription')}</h4>
        <span className="tw-my-2 sm:tw-my-2px tw-text-3xl tw-font-bold">RM 10.45</span>
      </div>
    </div>
  );
};

CashbackBlock.displayName = 'StoreInfoBanner';

export default CashbackBlock;
