import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useUnmount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { getIsOrderAndRedeemButtonDisplay } from '../../redux/selectors';
import PageFooter from '../../../../../../../common/components/PageFooter';
import Button from '../../../../../../../common/components/Button';
import styles from './MembershipDetailFooter.module.scss';

const MembershipDetailFooter = () => {
  const { t } = useTranslation(['Rewards']);
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isOrderAndRedeemButtonDisplay = useSelector(getIsOrderAndRedeemButtonDisplay);
  const [redirecting, setRedirecting] = React.useState(false);
  const merchantMenuPageDomain = `${process.env.REACT_APP_MERCHANT_STORE_URL.replace('%business%', merchantBusiness)}`;
  const handleClickOrderRedeemButton = useCallback(() => {
    setRedirecting(true);
    window.location.href = merchantMenuPageDomain;
  }, [merchantMenuPageDomain]);

  useUnmount(() => {
    setRedirecting(false);
  });

  if (!isOrderAndRedeemButtonDisplay) {
    return null;
  }

  return (
    <PageFooter className={styles.MembershipDetailFooter}>
      <Button
        className={styles.MembershipDetailFooterButton}
        block
        loading={redirecting}
        disabled={redirecting}
        data-test-id="rewards.business.membership-detail.order-redeem-button"
        onClick={handleClickOrderRedeemButton}
      >
        {t('OrderRedeemButtonText')}
      </Button>
    </PageFooter>
  );
};

MembershipDetailFooter.displayName = 'MembershipDetailFooter';

export default MembershipDetailFooter;
