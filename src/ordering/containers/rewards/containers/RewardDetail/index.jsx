import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import RewardDetailTicket from './components/RewardDetailTicket';
import styles from './RewardDetail.module.scss';

const RewardDetail = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const dispatch = useDispatch();
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader
        className={styles.RewardDetailPageHeader}
        title={t('VoucherPromoDetails')}
        onBackArrowClick={handleClickHeaderBackButton}
      />

      <RewardDetailTicket />
    </Frame>
  );
};

RewardDetail.displayName = 'RewardDetail';

export default RewardDetail;
