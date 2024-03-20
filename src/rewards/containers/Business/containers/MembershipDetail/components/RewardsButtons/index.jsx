import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import RewardsIcon from '../../../../../../../images/rewards-icon.svg';
import RewardsPointsIcon from '../../../../../../../images/rewards-points-icon.svg';
import { actions as membershipDetailActions } from '../../redux';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './RewardsButtons.module.scss';

const RewardsButtons = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const handlePointsDetailButtonClick = useCallback(() => {
    dispatch(membershipDetailActions.earnedPointsPromptDrawerShown());
  }, [dispatch]);

  return (
    <section className={styles.RewardsButtons}>
      <Button
        data-test-id="rewards.business.rewards-button.pints-button"
        theme="ghost"
        type="text"
        className={styles.RewardsButton}
        contentClassName={styles.RewardsButtonContent}
        onClick={handlePointsDetailButtonClick}
      >
        <div className={styles.RewardsButtonPointsIconContainer}>
          <ObjectFitImage noCompression src={RewardsPointsIcon} />
        </div>
        <div className={styles.RewardsButtonTitle}>
          <span className={styles.RewardsButtonPointsText}>{t('Points')}</span>
          <CaretRight size={12} />
        </div>
        <data className={styles.RewardsButtonPoints} value={500}>
          500
        </data>
      </Button>
      <Button
        data-test-id="rewards.business.rewards-button.rewards-button"
        theme="ghost"
        type="text"
        className={styles.RewardsButton}
        contentClassName={styles.RewardsButtonContent}
      >
        <div className={styles.RewardsButtonRewardsIconContainer}>
          <ObjectFitImage noCompression src={RewardsIcon} />
        </div>
        <div className={styles.RewardsButtonTitle}>
          <span className={styles.RewardsButtonRewardsText}>{t('MyRewards')}</span>
          <CaretRight size={12} />
        </div>
      </Button>
    </section>
  );
};

RewardsButtons.displayName = 'RewardsButtons';

export default RewardsButtons;
