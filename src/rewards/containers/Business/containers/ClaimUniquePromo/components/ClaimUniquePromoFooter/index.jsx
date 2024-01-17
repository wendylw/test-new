import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getIsClaimUniquePromoRequestPending } from '../../redux/selectors';
import { claimPromotionClicked } from '../../redux/thunks';
import PageFooter from '../../../../../../../common/components/PageFooter';
import Button from '../../../../../../../common/components/Button';
import styles from './ClaimUniquePromoFooter.module.scss';

const ClaimUniquePromoFooter = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isClaimUniquePromoRequestPending = useSelector(getIsClaimUniquePromoRequestPending);
  const handleClickClaimUniquePromoButton = useCallback(() => {
    dispatch(claimPromotionClicked());
  }, [dispatch]);

  return (
    <PageFooter zIndex={50}>
      <div className={styles.ClaimUniquePromoFooterContent}>
        <Button
          className={styles.ClaimUniquePromoFooterButton}
          block
          loading={isClaimUniquePromoRequestPending}
          disabled={isClaimUniquePromoRequestPending}
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
