import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getEnablePayLater } from '../../../../../../redux/modules/app';
import { getIsApplyRewardPending } from '../../../../redux/selectors';
import { getIsApplyButtonDisabled } from '../../redux/selectors';
import { applyReward, applyPayLaterReward } from '../../redux/thunks';
import PageFooter from '../../../../../../../common/components/PageFooter';
import Button from '../../../../../../../common/components/Button';
import styles from './RewardDetailFooter.module.scss';

const RewardDetailFooter = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const dispatch = useDispatch();
  const enablePayLater = useSelector(getEnablePayLater);
  const isApplyRewardPending = useSelector(getIsApplyRewardPending);
  const isApplyButtonDisabled = useSelector(getIsApplyButtonDisabled);
  const handleClickApplyRewardButton = useCallback(() => {
    enablePayLater ? dispatch(applyPayLaterReward()) : dispatch(applyReward());
  }, [dispatch, enablePayLater]);

  return (
    <PageFooter zIndex={50}>
      <div className={styles.RewardDetailFooterContent}>
        <Button
          block
          className={styles.RewardDetailFooterButton}
          data-test-id="ordering.reward-list.apply-button"
          disabled={isApplyButtonDisabled}
          loading={isApplyRewardPending}
          onClick={handleClickApplyRewardButton}
        >
          {t('ApplyNow')}
        </Button>
      </div>
    </PageFooter>
  );
};

RewardDetailFooter.displayName = 'RewardDetailFooter';

export default RewardDetailFooter;
