import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CleverTap from '../../../../../../../utils/clevertap';
import { getClient } from '../../../../../../../common/utils';
import { getMerchantBusiness } from '../../../../../../../redux/modules/merchant/selectors';
import { getIsClaimUniquePromoRequestCompleted } from '../../redux/selectors';
import { claimPromotionClicked } from '../../redux/thunks';
import PageFooter from '../../../../../../../common/components/PageFooter';
import Button from '../../../../../../../common/components/Button';
import styles from './ClaimUniquePromoFooter.module.scss';

const ClaimUniquePromoFooter = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(false);
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isClaimUniquePromoRequestCompleted = useSelector(getIsClaimUniquePromoRequestCompleted);
  const handleClickClaimUniquePromoButton = useCallback(() => {
    dispatch(claimPromotionClicked());
    setProcessing(true);

    CleverTap.pushEvent('Claim Unique Promo Landing Page - Click Claim Promotion Button', {
      'account name': merchantBusiness,
      source: getClient(),
    });
  }, [dispatch, merchantBusiness]);

  useEffect(() => {
    if (isClaimUniquePromoRequestCompleted) {
      setProcessing(false);
    }
  }, [isClaimUniquePromoRequestCompleted]);

  return (
    <PageFooter zIndex={50}>
      <div className={styles.ClaimUniquePromoFooterContent}>
        <Button
          className={styles.ClaimUniquePromoFooterButton}
          block
          loading={processing}
          disabled={processing}
          data-test-id="rewards.business.claim-unique-promo.claim-promotion-button"
          onClick={handleClickClaimUniquePromoButton}
        >
          {t('ClaimPromotion')}
        </Button>
      </div>
    </PageFooter>
  );
};

ClaimUniquePromoFooter.displayName = 'ClaimUniquePromoFooter';

export default ClaimUniquePromoFooter;
