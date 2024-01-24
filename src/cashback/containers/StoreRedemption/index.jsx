import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMount } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import { alert } from '../../../common/utils/feedback';
import {
  isWebview,
  isTNGMiniProgram,
  isGCashMiniProgram,
  judgeClient,
  getIsThePageHidden,
  getIsDesktopClients,
} from '../../../common/utils';
import CleverTap from '../../../utils/clevertap';
import { closeWebView } from '../../../utils/native-methods';
import { getUserCountry } from '../../redux/modules/app';
import { getIsLoadCustomerRequestCompleted } from '../../redux/modules/customer/selectors';
import {
  getIsStoreRedemptionNewCustomer,
  getIsDisplayStoreRedemptionContent,
  getIsLoadStoreRedemptionDataCompleted,
  getIsAvailableToShareConsumerInfo,
} from './redux/selectors';
import { mounted, confirmToShareConsumerInfoRequests } from './redux/thunks';
import Loader from '../../../common/components/Loader';
import Button from '../../../common/components/Button';
import RedemptionStoreInfo from './components/RedemptionStoreInfo';
import CashbackBlock from './components/CashbackBlock';
import NativeHeader from '../../../components/NativeHeader';
import EarnedCashbackIcon from '../../../images/rewards-earned-cashback.svg';
import PowerByStoreHubLogo from '../../../images/power-by-storehub-logo.svg';
import BeepAppLogo from '../../../images/app-beep-logo.svg';
import TNGAppLogo from '../../../images/app-tng-logo.svg';
import StoreRedemptionImage from '../../../images/store-redemption.png';
import { ObjectFitImage } from '../../../common/components/Image';
import '../../../common/styles/base.scss';
import styles from './StoreRedemption.module.scss';

const StoreRedemptionNative = () => {
  const { t } = useTranslation('Cashback');
  const dispatch = useDispatch();
  const isLoadCustomerRequestCompleted = useSelector(getIsLoadCustomerRequestCompleted);
  // get is display store redemption content
  const isDisplayStoreRedemptionContent = useSelector(getIsDisplayStoreRedemptionContent);
  const userCountry = useSelector(getUserCountry);
  const isAvailableToShareConsumerInfo = useSelector(getIsAvailableToShareConsumerInfo);
  const isStoreRedemptionNewCustomer = useSelector(getIsStoreRedemptionNewCustomer);

  useEffect(() => {
    if (isLoadCustomerRequestCompleted) {
      CleverTap.pushEvent('POS Redemption Landing Page - View Page', {
        country: userCountry,
        page: isDisplayStoreRedemptionContent
          ? 'With Cashback'
          : `Without Cashback (${isStoreRedemptionNewCustomer ? 'New' : 'Returning'} Customer)`,
      });
    }
  }, [isDisplayStoreRedemptionContent, isLoadCustomerRequestCompleted, isStoreRedemptionNewCustomer, userCountry]);

  useEffect(() => {
    if (isLoadCustomerRequestCompleted && isDisplayStoreRedemptionContent) {
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
  }, [isDisplayStoreRedemptionContent, isLoadCustomerRequestCompleted, t, userCountry]);

  useEffect(() => {
    if (isAvailableToShareConsumerInfo) {
      dispatch(confirmToShareConsumerInfoRequests());
    }
  }, [dispatch, isAvailableToShareConsumerInfo]);

  if (!isLoadCustomerRequestCompleted) {
    return (
      <div className="tw-flex-1 tw-flex tw-items-center tw-justify-center">
        <Loader className="tw-text-3xl tw-text-orange" weight="bold" />
      </div>
    );
  }

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
    </>
  );
};

StoreRedemptionNative.displayName = 'StoreRedemptionNative';

const StoreRedemption = () => {
  const { t } = useTranslation('Cashback');
  const dispatch = useDispatch();
  const client = judgeClient();
  const userCountry = useSelector(getUserCountry);
  const isLoadStoreRedemptionDataCompleted = useSelector(getIsLoadStoreRedemptionDataCompleted);
  const isDisplayWebResult = !isWebview() && !isTNGMiniProgram() && !isGCashMiniProgram();
  const handleGotoBeepDownloadPage = useCallback(() => {
    const downloadBeepAppDeepLink = `${process.env.REACT_APP_BEEP_DOWNLOAD_DEEP_LINK}&utm_source=beepqr&utm_medium=banner&utm_campaign=seamlessloyalty`;

    CleverTap.pushEvent('POS Redemption Landing Page - Click Beep App Logo', {
      country: userCountry,
      page: 'When users scan QR with phone camera (web)',
    });

    if (getIsDesktopClients(client)) {
      window.open(downloadBeepAppDeepLink, '_blank');
    } else {
      window.location.href = downloadBeepAppDeepLink;
    }
  }, [client, userCountry]);
  const handleGotoTNGApp = useCallback(() => {
    CleverTap.pushEvent('POS Redemption Landing Page - Click TNG App Logo', {
      country: userCountry,
      page: 'When users scan QR with phone camera (web)',
    });

    // It is the deep link of TNG. If TNG exists, it will jump directly.
    window.location.href = `${process.env.REACT_APP_TNG_APP_DEEP_LINK_DOMAIN}?mpid=${process.env.REACT_APP_TNG_MPID}&path=%2Fpages%2Findex%2Findex&qrValue=${window.location.href}`;

    // This is the deep link for downloading TNG. If the user has not downloaded TNG, clicking the logo will jump to the page for downloading TNG.
    setTimeout(() => {
      const hidden = getIsThePageHidden();

      if (typeof hidden === 'undefined' || hidden === false) {
        // redirect to TNG download page deep link
        window.location.href = process.env.REACT_APP_TNG_DOWNLOAD_DEEP_LINK;
      }
    }, 500);
  }, [userCountry]);

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
          <h2 className={styles.StoreRedemptionWebContentTitle}>
            <Trans i18nKey="SeamlessLoyaltyWebTitle">
              Please choose the
              <br />
              app below to continue{' '}
            </Trans>
          </h2>
          <div className={styles.StoreRedemptionWebLogoButtons}>
            <Button
              block
              contentClassName={styles.StoreRedemptionWebLogoButtonContent}
              type="text"
              theme="ghost"
              onClick={handleGotoBeepDownloadPage}
              data-test-id="seamless-loyalty.beep-app-button"
            >
              <div className={styles.StoreRedemptionWebLogoButtonImage}>
                <ObjectFitImage noCompression src={BeepAppLogo} alt="StoreHub Redemption Beep App Logo" />
              </div>
              <span className={styles.StoreRedemptionWebLogoButtonText}>{t('SeamlessLoyaltyBeepAppButtonText')}</span>
              <CaretRight size={24} />
            </Button>
            <Button
              block
              contentClassName={styles.StoreRedemptionWebLogoButtonContent}
              type="text"
              theme="ghost"
              onClick={handleGotoTNGApp}
              data-test-id="seamless-loyalty.tng-app-button"
            >
              <div className={styles.StoreRedemptionWebLogoButtonImage}>
                <ObjectFitImage noCompression src={TNGAppLogo} alt="StoreHub Redemption TNG App Logo" />
              </div>
              <span className={styles.StoreRedemptionWebLogoButtonText}>
                {t('SeamlessLoyaltyTNGMiniProgramButtonText')}
              </span>
              <CaretRight size={24} />
            </Button>
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
