import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useMount } from 'react-use';
import { getClassName } from '../../../../../common/utils/ui';
import { getMerchantDisplayName } from '../../../../../redux/modules/merchant/selectors';
import { getIsWebview } from '../../../../redux/modules/common/selectors';
import { mounted, backButtonClicked, closeButtonClicked } from './redux/thunks';
import { getShouldShowBackButton } from './redux/selectors';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import MembershipTiersTabs from '../../components/MembershipTiersTabs';
import MemberCard from './components/MemberCard';
import RewardsButtons from './components/RewardsButtons';
import PointsRewards from './components/PointsRewards';
import BirthdayCampaign from './components/BirthdayCampaign';
import MyRewards from './components/MyRewards';
import MemberPrompt from './components/MemberPrompt';
import Profile from '../../../Profile';
import styles from './MembershipDetail.module.scss';

const MembershipDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isWebview = useSelector(getIsWebview);
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const shouldShowBackButton = useSelector(getShouldShowBackButton);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickHeaderCloseButton = useCallback(() => dispatch(closeButtonClicked()), [dispatch]);
  const handleClickSkipProfileButton = useCallback(
    skipProfile => {
      skipProfile && skipProfile();
    },
    [dispatch, setSelectedRewardId]
  );
  const handleClickSaveProfileButton = useCallback(saveProfile => {
    saveProfile && saveProfile();
  }, []);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader
        className={styles.MembershipDetailPageHeader}
        leftContentClassName={styles.MembershipDetailPageHeaderLeftContent}
        titleClassName={getClassName([
          styles.MembershipDetailPageHeaderTitle,
          shouldShowBackButton ? null : styles.MembershipDetailPageHeaderTitleNoBack,
        ])}
        isShowBackButton={shouldShowBackButton}
        title={merchantDisplayName}
        onBackArrowClick={shouldShowBackButton ? handleClickHeaderBackButton : handleClickHeaderCloseButton}
      />
      <MemberCard />
      <RewardsButtons />
      <PointsRewards />
      <BirthdayCampaign />
      <MyRewards />
      <section className={styles.MembershipDetailBenefitsSection}>
        <h2 className={styles.MembershipDetailBenefitsTitle}>{t('MembershipBenefits')}</h2>
        <MembershipTiersTabs />
      </section>
      <MemberPrompt />
      {!isWebview && (
        <Profile
          showSkipButton={isSkipButtonShow}
          show={isProfileModalShow}
          onSave={handleClickSaveProfileButton}
          onSkip={handleClickSkipProfileButton}
        />
      )}
    </Frame>
  );
};

MembershipDetail.displayName = 'MembershipDetail';

export default MembershipDetail;
