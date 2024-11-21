import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getEnablePayLater } from '../../../../../../redux/modules/app';
import { getIsApplyRewardPending, getIsApplyButtonDisabled } from '../../redux/selectors';
import { applyReward, applyPayLaterReward } from '../../redux/thunks';
import PageFooter from '../../../../../../../common/components/PageFooter';
import Button from '../../../../../../../common/components/Button';
import styles from './RewardListFooter.module.scss';

const RewardListFooter = () => {
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
      <div className={styles.RewardListFooterContent}>
        <Button
          block
          className={styles.RewardListFooterButton}
          data-test-id="ordering.reward-list.apply-button"
          disabled={isApplyButtonDisabled}
          loading={isApplyRewardPending}
          onClick={handleClickApplyRewardButton}
        >
          {t('Apply')}
        </Button>
      </div>
    </PageFooter>
  );
};

RewardListFooter.displayName = 'RewardListFooter';

export default RewardListFooter;
