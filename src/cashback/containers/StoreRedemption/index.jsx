import React, { useEffect } from 'react';
import { useMount } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { alert } from '../../../common/utils/feedback';
import CleverTap from '../../../utils/clevertap';
import { closeWebView } from '../../../utils/native-methods';
import { getIsWebview } from '../../redux/modules/common/selectors';
import { getUserCountry } from '../../redux/modules/app';
import { getIsLoadCustomerRequestCompleted } from '../../redux/modules/customer/selectors';
import { getIsStoreRedemptionNewCustomer, getIsRedemptionCashbackEnabled } from './redux/selectors';
import { mounted } from './redux/thunks';
import Loader from '../../../common/components/Loader';
import RedemptionStoreInfo from './components/RedemptionStoreInfo';
import CashbackBlock from './components/CashbackBlock';
import NativeHeader from '../../../components/NativeHeader';
import EarnedCashbackIcon from '../../../images/rewards-earned-cashback.svg';
import StoreRedemptionImage from '../../../images/store-redemption.png';
import { ObjectFitImage } from '../../../common/components/Image';
import '../../../common/styles/base.scss';
import styles from './StoreRedemption.module.scss';

const StoreRedemption = () => {
  const { t } = useTranslation('Cashback');
  const dispatch = useDispatch();
  const isWebview = useSelector(getIsWebview);
  const userCountry = useSelector(getUserCountry);
  const isLoadCustomerRequestCompleted = useSelector(getIsLoadCustomerRequestCompleted);
  const isRedemptionCashbackEnabled = useSelector(getIsRedemptionCashbackEnabled);
  const isStoreRedemptionNewCustomer = useSelector(getIsStoreRedemptionNewCustomer);

  useMount(async () => {
    await dispatch(mounted());
  });

  useEffect(() => {
    if (isRedemptionCashbackEnabled) {
      alert(
        <div className={styles.StoreRedemptionAlertContent}>
          <div className={styles.StoreRedemptionAlertIcon}>
            <ObjectFitImage noCompression src={EarnedCashbackIcon} alt="Store New Member Icon in StoreHub" />
          </div>
          <h4 className={styles.StoreRedemptionAlertTitle}>{t('StoreRedemptionCashRedeemAlert')}</h4>
        </div>,
        {
          id: 'StoreRedemptionInitialAlert',
          onClose: () => {
            CleverTap.pushEvent('POS Redemption Landing Page (Pop-up) - Click OKAY', {
              country: userCountry,
            });
          },
        }
      );
    }
  }, [isRedemptionCashbackEnabled, t, userCountry]);

  if (!isLoadCustomerRequestCompleted) {
    return (
      <div className="tw-flex-1 tw-flex tw-items-center tw-justify-center">
        <Loader className="tw-text-3xl tw-text-orange" weight="bold" />
      </div>
    );
  }

  return (
    <>
      {isWebview && (
        <NativeHeader
          navFunc={() => {
            CleverTap.pushEvent('POS Redemption Landing Page - Click Back', {
              country: userCountry,
            });

            closeWebView();
          }}
        />
      )}
      <div className={`${styles.StoreRedemption} tw-flex tw-flex-col`}>
        <RedemptionStoreInfo />
        {isRedemptionCashbackEnabled ? (
          <section
            className={`${styles.StoreRedemptionContent} tw-px-16 sm:tw-px-16px tw--mt-24 sm:tw--mt-24px tw-flex-1`}
          >
            <CashbackBlock />
          </section>
        ) : (
          <section className="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-justify-center">
            <h2
              className={`${styles.StoreRedemptionGreetings} tw-flex-1 tw-flex tw-items-center tw-text-center tw-text-xl tw-leading-normal tw-font-bold`}
            >
              {isStoreRedemptionNewCustomer ? (
                t('StoreRedemptionNewUserGreetings')
              ) : (
                <Trans i18nKey="StoreRedemptionUserGreetings">
                  Thanks for coming back! Visit us
                  <br />
                  again next time.
                </Trans>
              )}
            </h2>
            <ObjectFitImage
              noCompression
              className={`${styles.StoreRedemptionDefaultImage} tw-flex-shrink-0`}
              src={StoreRedemptionImage}
              alt="StoreHub store redemption"
            />
          </section>
        )}
      </div>
    </>
  );
};

StoreRedemption.displayName = 'StoreRedemption';

export default StoreRedemption;
