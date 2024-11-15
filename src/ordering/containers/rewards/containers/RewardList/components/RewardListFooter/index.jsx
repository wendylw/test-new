import React from 'react';
import { useTranslation } from 'react-i18next';
import PageFooter from '../../../../../../../common/components/PageFooter';
import Button from '../../../../../../../common/components/Button';
import styles from './RewardListFooter.module.scss';

const RewardListFooter = () => {
  const { t } = useTranslation();

  return (
    <PageFooter zIndex={50}>
      <div className={styles.RewardListFooterContent}>
        <Button
          block
          className={styles.RewardListFooterButton}
          data-test-id="ordering.reward-list.apply-button"
          disabled={false}
          onClick={() => {}}
        >
          {t('ApplyNow')}
        </Button>
      </div>
    </PageFooter>
  );
};

RewardListFooter.displayName = 'RewardListFooter';

export default RewardListFooter;
