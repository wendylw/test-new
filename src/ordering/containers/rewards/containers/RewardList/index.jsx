import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { backButtonClicked } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import SearchReward from './components/SearchReward';
import TicketList from './components/TicketList';
import RewardListFooter from './components/RewardListFooter';
import styles from './RewardList.module.scss';

const RewardList = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const dispatch = useDispatch();
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  return (
    <Frame>
      <PageHeader
        className={styles.RewardListPageHeader}
        title={t('MyVouchersAndPromos')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <SearchReward />
      <TicketList />
      <RewardListFooter />
    </Frame>
  );
};

RewardList.displayName = 'RewardList';

export default RewardList;
