import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMount } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { alert } from '../../../common/utils/feedback';
import { isWebview, isTNGMiniProgram } from '../../../common/utils';
import CleverTap from '../../../utils/clevertap';
import { closeWebView } from '../../../utils/native-methods';
import { getUserCountry } from '../../redux/modules/app';
import { actions as customerActions } from '../../redux/modules/customer';
import {
  getIsStoreRedemptionNewCustomer,
  getIsDisplayStoreRedemptionContent,
  getIsLoadStoreRedemptionDataCompleted,
  getIsAvailableToShareConsumerInfo,
} from './redux/selectors';
import { mounted, confirmToShareConsumerInfoRequests } from './redux/thunks';
import Loader from '../../../common/components/Loader';
import RedemptionStoreInfo from './components/RedemptionStoreInfo';
import CashbackBlock from './components/CashbackBlock';
import NativeHeader from '../../../components/NativeHeader';
import PowerByStoreHubLogo from '../../../images/power-by-storehub-logo.svg';
import BeepAppLogo from '../../../images/app-beep-logo.svg';
import TNGAppLogo from '../../../images/app-tng-logo.svg';
import StoreRedemptionImage from '../../../images/store-redemption.png';
import '../../../common/styles/base.scss';
import styles from './StoreRedemption.module.scss';
import { ObjectFitImage } from '../../../common/components/Image';

const StoreRedemptionNative = () => {
  const { t } = useTranslation('Cashback');
  const dispatch = useDispatch();
  // get is display store redemption content
  const isDisplayStoreRedemptionContent = useSelector(getIsDisplayStoreRedemptionContent);
  const userCountry = useSelector(getUserCountry);
  const isAvailableToShareConsumerInfo = useSelector(getIsAvailableToShareConsumerInfo);
  const isStoreRedemptionNewCustomer = useSelector(getIsStoreRedemptionNewCustomer);

  useMount(() => {
    CleverTap.pushEvent('POS Redemption Landing Page - View Page', {
      country: userCountry,
      page: isDisplayStoreRedemptionContent
        ? 'With Cashback'
        : `Without Cashback (${isStoreRedemptionNewCustomer ? 'New' : 'Returning'} Customer)`,
    });

    if (isDisplayStoreRedemptionContent) {
      alert(
        <p className="tw-text-xl tw-text-gray tw-font-bold tw-leading-loose">{t('StoreRedemptionCashRedeemAlert')}</p>,
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
  });

  useEffect(() => {
    if (isAvailableToShareConsumerInfo) {
      dispatch(confirmToShareConsumerInfoRequests()).then(() => {
        dispatch(customerActions.customerLoadableUpdate(true));
      });
    }
  }, [dispatch, isAvailableToShareConsumerInfo]);

  return (
    <>
      <RedemptionStoreInfo />
      {isDisplayStoreRedemptionContent ? (
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
                Thanks for visiting our store.
                <br />
                See you again!
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
    </>
  );
};

StoreRedemptionNative.displayName = 'StoreRedemptionNative';

const StoreRedemption = () => {
  const dispatch = useDispatch();
  const userCountry = useSelector(getUserCountry);
  const isLoadStoreRedemptionDataCompleted = useSelector(getIsLoadStoreRedemptionDataCompleted);
  const isDisplayWebResult = !isWebview() && !isTNGMiniProgram();

  useMount(async () => {
    if (isDisplayWebResult) {
      CleverTap.pushEvent('POS Redemption Landing Page - View Page', {
        country: userCountry,
        page: 'When users scan QR with phone camera (web)',
      });
    } else {
      await dispatch(mounted());
    }
  });

  if (isDisplayWebResult) {
    // Use createPortal to load the page because the Login Modal in App/index level DOM needs to be covered
    return createPortal(
      <div className={`${styles.StoreRedemptionWeb} tw-flex tw-flex-col`}>
        <header className={styles.StoreRedemptionHeader}>
          <h1 className={styles.StoreRedemptionHeaderLogoContainer}>
            <img src={PowerByStoreHubLogo} alt="StoreHub Redemption power by StoreHub" />
          </h1>
        </header>
        <section className={styles.StoreRedemptionWebContent}>
          <h2 className="tw-text-center tw-text-3xl tw-leading-normal tw-text-gray-50 tw-font-bold">
            Oops... <br />
            Please scan with
          </h2>
          <div className="tw-flex tw-p-24 sm:tw-p-24px tw-my-24 sm:tw-my-24px tw-gap-24 sm:tw-gap-24px tw-bg-gray-50 tw-rounded-2xl">
            <img className="tw-m-8 sm:tw-m-8px" src={BeepAppLogo} alt="StoreHub Redemption Beep App Logo" />
            <img className="tw-m-8 sm:tw-m-8px" src={TNGAppLogo} alt="StoreHub Redemption TNG App Logo" />
          </div>
        </section>
      </div>,
      document.getElementById('modal-mount-point')
    );
  }

  return (
    <>
      {isWebview() && (
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
        {isLoadStoreRedemptionDataCompleted ? (
          <StoreRedemptionNative />
        ) : (
          <div className="tw-flex-1 tw-flex tw-items-center tw-justify-center">
            <Loader className="tw-text-3xl tw-text-orange" weight="bold" />
          </div>
        )}
      </div>
    </>
  );
};

StoreRedemption.displayName = 'StoreRedemption';

export default StoreRedemption;
