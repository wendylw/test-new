import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLifecycles, useSetState } from 'react-use';
import { useTranslation } from 'react-i18next';
import { actions as rewardsActions } from '../../../../../redux/modules/rewards';
import { getIsApplyRewardPending } from '../../redux/selectors';
import { getIsCustomerEmptyReward, getIsSearchEmptyReward, getIsRewardListSearching } from './redux/selectors';
import { mounted, backButtonClicked } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import PageToast from '../../../../../common/components/PageToast';
import Loader from '../../../../../common/components/Loader';
import SearchReward from './components/SearchReward';
import SkeletonLoader from './components/SkeletonLoader';
import TicketList from './components/TicketList';
import EmptyVoucher from './components/EmptyVoucher';
import EmptySearchResult from './components/EmptySearchResult';
import RewardListFooter from './components/RewardListFooter';
import styles from './RewardList.module.scss';

const RewardList = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const dispatch = useDispatch();
  const [mountedStatus, setMountedStatus] = useSetState(false);
  const isApplyRewardPending = useSelector(getIsApplyRewardPending);
  const isSearchEmptyReward = useSelector(getIsSearchEmptyReward);
  const isCustomerEmptyReward = useSelector(getIsCustomerEmptyReward);
  const isRewardListSearching = useSelector(getIsRewardListSearching);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useLifecycles(
    () => {
      dispatch(mounted()).then(() => {
        setMountedStatus(true);
      });
    },
    () => {
      dispatch(rewardsActions.resetRewardsState());
    }
  );

  return (
    <Frame>
      <PageHeader
        className={styles.RewardListPageHeader}
        title={t('MyVouchersAndPromos')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <SearchReward />
      {isSearchEmptyReward ? (
        <EmptySearchResult />
      ) : isCustomerEmptyReward ? (
        <EmptyVoucher />
      ) : isRewardListSearching ? (
        <section className={styles.RewardListSearchLoaderSection}>
          <div className={styles.RewardListSearchLoaderContainer}>
            <Loader className={styles.RewardListSearchLoader} size={30} />
            <span className={styles.RewardListSearchLoaderText}>{t('Searching')}</span>
          </div>
        </section>
      ) : mountedStatus ? (
        <TicketList />
      ) : (
        <SkeletonLoader />
      )}

      <RewardListFooter />
      {isApplyRewardPending && (
        <PageToast icon={<Loader className="tw-m-8 sm:tw-m-8px" size={30} />}>{`${t('Processing')}...`}</PageToast>
      )}
    </Frame>
  );
};

RewardList.displayName = 'RewardList';

export default RewardList;
