import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useUnmount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { getIsWeb } from '../../../../../../redux/modules/common/selectors';
import { getIsCongratulationFooterDisplay } from '../../redux/selectors';
import PageFooter from '../../../../../../../common/components/PageFooter';
import Button from '../../../../../../../common/components/Button';
import DownloadBanner from '../../../../../../../common/components/DownloadBanner';
import styles from './UniquePromCongratulationFooter.module.scss';

const UniquePromCongratulationFooter = () => {
  const { t } = useTranslation(['Rewards']);
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWeb = useSelector(getIsWeb);
  const isCongratulationFooterDisplay = useSelector(getIsCongratulationFooterDisplay);
  const [redirecting, setRedirecting] = useState(false);
  const merchantMenuPageDomain = `${process.env.REACT_APP_MERCHANT_STORE_URL.replace('%business%', merchantBusiness)}`;
  const handleClickOrderRedeemButton = useCallback(() => {
    setRedirecting(true);
    window.location.href = merchantMenuPageDomain;
  }, [merchantMenuPageDomain]);

  useUnmount(() => {
    setRedirecting(false);
  });

  if (!isCongratulationFooterDisplay) {
    return null;
  }

  return (
    <PageFooter zIndex={50}>
      <div className={styles.UniquePromCongratulationFooterContent}>
        {isWeb ? (
          <DownloadBanner />
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
