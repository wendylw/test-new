import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { alert } from '../../../common/utils/feedback';
import { getUserStoreCashback } from '../../redux/modules/app';
import { getStoreDisplayTitle } from './redux/selectors';
import { mounted } from './redux/thunks';
import RedemptionStoreInfo from './components/RedemptionStoreInfo';
import CashbackBlock from './components/CashbackBlock';
import '../../../common/styles/base.scss';
import styles from './StoreRedemption.module.scss';

const StoreRedemption = () => {
  const { t } = useTranslation('Cashback');
  const dispatch = useDispatch();
  // get store display title, storeBrandName || onlineStoreName
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);
  // get is display store redemption content
  const userStoreCashback = useSelector(getUserStoreCashback);
  const showStoreRedemptionAlert = true;

  useEffect(() => {
    if (showStoreRedemptionAlert) {
      alert(
        <p className="tw-text-xl tw-text-gray tw-font-bold tw-leading-loose">
          {userStoreCashback > 0
            ? t('StoreRedemptionCashRedeemAlert')
            : t('StoreRedemptionNoCashbackAlert', { storeDisplayTitle })}
        </p>,
        {
          id: 'StoreRedemptionInitialAlert',
        }
      );
    }
  }, [userStoreCashback, showStoreRedemptionAlert, storeDisplayTitle, t]);

  useMount(async () => {
    await dispatch(mounted());
  });

  return (
    <div className={`${styles.StoreRedemption} tw-flex tw-flex-col`}>
      <RedemptionStoreInfo />
      <section className={`${styles.StoreRedemptionContent} tw-px-16 sm:tw-px-16px tw--mt-24 sm:tw--mt-24px tw-flex-1`}>
        <CashbackBlock />
      </section>
    </div>
  );
};

StoreRedemption.displayName = 'StoreRedemption';

export default StoreRedemption;
