import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useUnmount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { getClient } from '../../../../../../../common/utils';
import CleverTap from '../../../../../../../utils/clevertap';
import { getUserCountry } from '../../../../../../../redux/modules/user/selectors';
import { getMerchantBusiness } from '../../../../../../../redux/modules/merchant/selectors';
import { getIsWeb } from '../../../../../../redux/modules/common/selectors';
import { getIsCongratulationFooterDisplay } from '../../redux/selectors';
import PageFooter from '../../../../../../../common/components/PageFooter';
import Button from '../../../../../../../common/components/Button';
import DownloadBanner from '../../../../../../../common/components/DownloadBanner';
import styles from './UniquePromCongratulationFooter.module.scss';

const UniquePromCongratulationFooter = () => {
  const { t } = useTranslation(['Rewards']);
  const userCountry = useSelector(getUserCountry);
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWeb = useSelector(getIsWeb);
  const isCongratulationFooterDisplay = useSelector(getIsCongratulationFooterDisplay);
  const [redirecting, setRedirecting] = useState(false);
  const merchantMenuPageDomain = `${process.env.REACT_APP_MERCHANT_STORE_URL.replace('%business%', merchantBusiness)}`;
  const downloadBeepAppDeepLink = `${process.env.REACT_APP_BEEP_DOWNLOAD_DEEP_LINK}?utm_source=merchantpromo&utm_medium=banner&utm_campaign=claimpromo`;
  const handleClickOrderRedeemButton = useCallback(() => {
    CleverTap.pushEvent('Claim Unique Promo Landing Page - Click Order & Redeem Now Button', {
      country: userCountry,
      'account name': merchantBusiness,
      source: getClient(),
    });

    setRedirecting(true);
    window.location.href = merchantMenuPageDomain;
  }, [merchantMenuPageDomain, merchantBusiness, userCountry]);

  useUnmount(() => {
    setRedirecting(false);
  });

  if (!isCongratulationFooterDisplay) {
    return null;
  }

  return (
    <PageFooter className={isWeb && styles.UniquePromCongratulationFooter} zIndex={50}>
      <div className={styles.UniquePromCongratulationFooterContent}>
        {isWeb ? (
          <DownloadBanner link={downloadBeepAppDeepLink} text={t('UniquePromoDownloadBannerText')} />
        ) : (
          <Button
            className={styles.UniquePromCongratulationFooterButton}
            block
            loading={redirecting}
            disabled={redirecting}
            data-test-id="rewards.business.claim-unique-promo.order-redeem-button"
            onClick={handleClickOrderRedeemButton}
          >
            {t('OrderRedeemButtonText')}
          </Button>
        )}
      </div>
    </PageFooter>
  );
};

UniquePromCongratulationFooter.displayName = 'UniquePromCongratulationFooter';

export default UniquePromCongratulationFooter;
