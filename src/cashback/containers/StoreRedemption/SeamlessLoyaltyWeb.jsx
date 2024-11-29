import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useMount } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import PowerByStoreHubLogo from '../../../images/power-by-storehub-logo.svg';
import BeepAppLogo from '../../../images/app-beep-logo.svg';
import TNGAppLogo from '../../../images/app-tng-logo.svg';
import { judgeClient, getIsThePageHidden, getIsDesktopClients } from '../../../common/utils';
import CleverTap from '../../../utils/clevertap';
import { getMerchantBusiness, getIsMalaysianMerchant } from '../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../redux/modules/merchant/thunks';
import { getUserCountry } from '../../redux/modules/app';
import Button from '../../../common/components/Button';
import { ObjectFitImage } from '../../../common/components/Image';
import '../../../common/styles/base.scss';
import styles from './StoreRedemption.module.scss';

const SeamlessLoyaltyWeb = () => {
  const { t } = useTranslation('Cashback');
  const dispatch = useDispatch();
  const client = judgeClient();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isMalaysianMerchant = useSelector(getIsMalaysianMerchant);
  const userCountry = useSelector(getUserCountry);
  const handleGotoBeepDownloadPage = useCallback(() => {
    const downloadBeepAppDeepLink = `${process.env.REACT_APP_BEEP_DOWNLOAD_DEEP_LINK}?utm_source=beepqr&utm_medium=banner&utm_campaign=seamlessloyalty`;

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

  useMount(() => {
    CleverTap.pushEvent('POS Redemption Landing Page - View Page', {
      country: userCountry,
      page: 'When users scan QR with phone camera (web)',
    });

    dispatch(fetchMerchantInfo(merchantBusiness));
  });

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

          {isMalaysianMerchant && (
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
          )}
        </div>
      </section>
    </div>,
    document.getElementById('modal-mount-point')
  );
};

SeamlessLoyaltyWeb.displayName = 'SeamlessLoyaltyWeb';

export default SeamlessLoyaltyWeb;
