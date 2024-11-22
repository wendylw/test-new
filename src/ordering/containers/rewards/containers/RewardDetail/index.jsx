import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { backButtonClicked } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import styles from './RewardDetail.module.scss';

const RewardDetail = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const dispatch = useDispatch();
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  return (
    <Frame>
      <PageHeader
        className={styles.RewardDetailPageHeader}
        title={t('VoucherPromoDetails')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
    </Frame>
  );
};

RewardDetail.displayName = 'RewardDetail';

export default RewardDetail;
