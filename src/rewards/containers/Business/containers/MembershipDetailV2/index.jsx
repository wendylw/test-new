import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useMount } from 'react-use';
import { getClassName } from '../../../../../common/utils/ui';
import {
  getMerchantDisplayName,
  getIsLoadMerchantRequestCompleted,
  getIsMerchantEnabledStoreCredits,
} from '../../../../../redux/modules/merchant/selectors';
import {
  mounted,
  backButtonClicked,
  membershipTierTabClickedForCleverTap,
  closeButtonClicked,
  hideWebProfileForm,
} from './redux/thunks';
import { getShouldShowBackButton, getIsProfileModalShow, getIsMemberCardShow } from './redux/selectors';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import MembershipTiersTabs from '../../components/MembershipTiersTabs';
import MemberCard from './components/MemberCard';
import CashbackCard from './components/CashbackCard';
import StoreCreditsCard from './components/StoreCreditsCard';
import RewardsButtons from './components/RewardsButtons';
import PointsRewards from './components/PointsRewards';
import BirthdayCampaign from './components/BirthdayCampaign';
import MyRewards from './components/MyRewards';
import MemberPrompt from './components/MemberPrompt';
import CompleteProfile from '../../../CompleteProfile';
import styles from './MembershipDetail.module.scss';

const MembershipDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isProfileModalShow = useSelector(getIsProfileModalShow);
  const isLoadMerchantRequestCompleted = useSelector(getIsLoadMerchantRequestCompleted);
  const isMerchantEnabledStoreCredits = useSelector(getIsMerchantEnabledStoreCredits);
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const shouldShowBackButton = useSelector(getShouldShowBackButton);
  const isMemberCardShow = useSelector(getIsMemberCardShow);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickHeaderCloseButton = useCallback(() => dispatch(closeButtonClicked()), [dispatch]);
  const handleClickMembershipTierTab = useCallback(
    tierName => dispatch(membershipTierTabClickedForCleverTap(tierName)),
    [dispatch]
  );
  const handleCloseCompleteProfile = useCallback(() => dispatch(hideWebProfileForm()), [dispatch]);

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
      {isLoadMerchantRequestCompleted ? (
        isMemberCardShow ? (
          <MemberCard />
        ) : isMerchantEnabledStoreCredits ? (
          <StoreCreditsCard />
        ) : (
          <CashbackCard />
        )
      ) : null}
      <RewardsButtons />
      <PointsRewards />
      <BirthdayCampaign />
      <MyRewards />
      <section className={styles.MembershipDetailBenefitsSection}>
        <h2 className={styles.MembershipDetailBenefitsTitle}>{t('MembershipBenefits')}</h2>
        <MembershipTiersTabs onClickMembershipTierTab={handleClickMembershipTierTab} />
      </section>
      <MemberPrompt />
      <CompleteProfile show={isProfileModalShow} onClose={handleCloseCompleteProfile} />
    </Frame>
  );
};

MembershipDetail.displayName = 'MembershipDetail';

export default MembershipDetail;
