import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMount } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { alert } from '../../../common/utils/feedback';
import { isWebview, isTNGMiniProgram } from '../../../common/utils';
import { getUserStoreCashback } from '../../redux/modules/app';
import {
  getStoreDisplayTitle,
  getIsDisplayStoreRedemptionContent,
  getIsLoadStoreRedemptionDataCompleted,
  getIsAvailableToShareConsumerInfo,
} from './redux/selectors';
import { mounted, confirmToShareConsumerInfoRequests } from './redux/thunks';
import Loader from '../../../common/components/Loader';
import RedemptionStoreInfo from './components/RedemptionStoreInfo';
import CashbackBlock from './components/CashbackBlock';
import PowerByBeepLogo from '../../../images/powered-by-beep-logo.svg';
import BeepAppLogo from '../../../images/app-beep-logo.svg';
import TNGAppLogo from '../../../images/app-tng-logo.svg';
import '../../../common/styles/base.scss';
import styles from './StoreRedemption.module.scss';

const StoreRedemptionNative = () => {
  const { t } = useTranslation('Cashback');
  const dispatch = useDispatch();
  // get store display title, storeBrandName || onlineStoreName
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);
  // get is display store redemption content
  const isDisplayStoreRedemptionContent = useSelector(getIsDisplayStoreRedemptionContent);
  const userStoreCashback = useSelector(getUserStoreCashback);
  const isLoadStoreRedemptionDataCompleted = useSelector(getIsLoadStoreRedemptionDataCompleted);
  const isAvailableToShareConsumerInfo = useSelector(getIsAvailableToShareConsumerInfo);

  useEffect(() => {
    if (isLoadStoreRedemptionDataCompleted) {
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
  }, [userStoreCashback, isLoadStoreRedemptionDataCompleted, storeDisplayTitle, t]);

  useEffect(() => {
    if (isAvailableToShareConsumerInfo) {
      dispatch(confirmToShareConsumerInfoRequests());
    }
  }, [dispatch, isAvailableToShareConsumerInfo]);

  useMount(async () => {
    await dispatch(mounted());
  });

  return (
    <div className={`${styles.StoreRedemption} tw-flex tw-flex-col`}>
      {isLoadStoreRedemptionDataCompleted ? (
        <>
          <RedemptionStoreInfo />
          {isDisplayStoreRedemptionContent ? (
            <section
              className={`${styles.StoreRedemptionContent} tw-px-16 sm:tw-px-16px tw--mt-24 sm:tw--mt-24px tw-flex-1`}
            >
              <CashbackBlock />
            </section>
          ) : null}
        </>
      ) : (
        <div className="tw-flex-1 tw-flex tw-items-center tw-justify-center">
          <Loader className="tw-text-3xl tw-text-orange" weight="bold" />
        </div>
      )}
    </div>
  );
};

StoreRedemptionNative.displayName = 'StoreRedemptionNative';

const StoreRedemption = () => {
  const isDisplayWebResult = !isWebview() && !isTNGMiniProgram();

  if (isDisplayWebResult) {
    return createPortal(
      <div className={`${styles.StoreRedemptionWeb} tw-flex tw-flex-col`}>
        <header className={styles.StoreRedemptionHeader}>
          <h1 className={styles.StoreRedemptionHeaderLogoContainer}>
            <img src={PowerByBeepLogo} alt="StoreHub Redemption power by beep" />
          </h1>
        </header>
        <section className={styles.StoreRedemptionWebContent}>
          <h2 className="tw-text-center tw-my-12 sm:tw-my-12px tw-text-3xl tw-leading-relaxed tw-text-gray-50 tw-font-bold">
            Oops... <br />
            Please scan with
          </h2>
          <div className="tw-flex tw-p-24 sm:tw-p-24px tw-my-12 sm:tw-my-12px tw-gap-24 sm:tw-gap-24px tw-bg-gray-50 tw-rounded-2xl">
            <img className="tw-m-8 sm:tw-m-8px" src={BeepAppLogo} alt="StoreHub Redemption Beep App Logo" />
            <img className="tw-m-8 sm:tw-m-8px" src={TNGAppLogo} alt="StoreHub Redemption TNG App Logo" />
          </div>
        </section>
      </div>,
      document.getElementById('modal-mount-point')
    );
  }

  return <StoreRedemptionNative />;
};

StoreRedemption.displayName = 'StoreRedemption';

export default StoreRedemption;
