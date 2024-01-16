import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getIsLogin } from '../../../../../../../redux/modules/user/selectors';
import { actions as claimPromotionActions } from '../../redux';
import { getIsClaimPromotionClicked } from '../../redux/selectors';
import { claimUniquePromo, claimPromotionClicked } from '../../redux/thunks';
import PageFooter from '../../../../../../../common/components/PageFooter';
import Button from '../../../../../../../common/components/Button';
import styles from './ClaimUniquePromoFooter.module.scss';

const ClaimUniquePromoFooter = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isLogin = useSelector(getIsLogin);
  const isClaimPromotionClicked = useSelector(getIsClaimPromotionClicked);
  const handleClickClaimUniquePromoButton = useCallback(() => {
    dispatch(claimPromotionClicked());
    dispatch(claimPromotionActions.setIsClaimPromotionClicked(true));
  }, [dispatch]);

  useEffect(() => {
    if (isLogin && isClaimPromotionClicked) {
      dispatch(claimUniquePromo());
    }
  }, [dispatch, isClaimPromotionClicked, isLogin]);

  return (
    <PageFooter zIndex={50}>
      <div className={styles.ClaimUniquePromoFooterContent}>
        <Button
          block
          loading={isClaimPromotionClicked}
          disabled={isClaimPromotionClicked}
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
