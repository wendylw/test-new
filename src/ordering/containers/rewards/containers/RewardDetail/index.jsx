import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { getIsApplyRewardPending } from '../../redux/selectors';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import PageToast from '../../../../../common/components/PageToast';
import Loader from '../../../../../common/components/Loader';
import RewardDetailTicket from './components/RewardDetailTicket';
import RewardDetailContent from './components/RewardDetailContent';
import RewardDetailFooter from './components/RewardDetailFooter';
import styles from './RewardDetail.module.scss';

const RewardDetail = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const dispatch = useDispatch();
  const isApplyRewardPending = useSelector(getIsApplyRewardPending);
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
      <RewardDetailContent />
      <RewardDetailFooter />
      {isApplyRewardPending && (
        <PageToast icon={<Loader className="tw-m-8 sm:tw-m-8px" size={30} />}>{`${t('Processing')}...`}</PageToast>
      )}
    </Frame>
  );
};

RewardDetail.displayName = 'RewardDetail';

export default RewardDetail;
