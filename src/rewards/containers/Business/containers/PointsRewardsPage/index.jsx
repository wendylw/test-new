import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import styles from './PointsRewardsPage.module.scss';

const PointsRewardsPage = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader
        className={styles.PointsRewardsPageHeader}
        title={t('GetRewards')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
    </Frame>
  );
};

PointsRewardsPage.displayName = 'PointsRewardsPage';

export default PointsRewardsPage;
