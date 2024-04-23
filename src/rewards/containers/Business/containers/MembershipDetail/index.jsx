import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { getClassName } from '../../../../../common/utils/ui';
import { getIsMerchantEnabledCashback, getMerchantDisplayName } from '../../../../../redux/modules/merchant/selectors';
import { getIsWeb } from '../../../../redux/modules/common/selectors';
import { mounted, backButtonClicked } from './redux/thunks';
import { getShouldShowBackButton } from './redux/selectors';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import MemberCard from './components/MemberCard';
import RewardsButtons from './components/RewardsButtons';
import CashbackBlock from '../../components/CashbackBlock';
import UniquePromoListSection from './components/UniquePromoListSection';
import PointsRewardList from './components/PointsRewardList';
import MembershipTiersInfoTabs from '../../components/MembershipTiersInfoTabs';
import MemberPrompt from './components/MemberPrompt';
import EarnedPointsPromptDrawer from './components/EarnedPointsPromptDrawer';
import styles from './MembershipDetail.module.scss';

const MembershipDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const isWeb = useSelector(getIsWeb);
  const isMerchantEnabledCashback = useSelector(getIsMerchantEnabledCashback);
  const shouldShowBackButton = useSelector(getShouldShowBackButton);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader
        className={getClassName([isWeb && styles.MembershipDetailWebPageHeader])}
        isShowBackButton={shouldShowBackButton}
        title={t('MembershipDetailPageTitle', { merchantDisplayName })}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <MemberCard />
      <RewardsButtons />
      <PointsRewardList />
      {isMerchantEnabledCashback ? (
        <section className={styles.MembershipDetailCashbackSection}>
          <h2 className={styles.MembershipDetailCashbackSectionTitle}>{t('Cashback')}</h2>
          <CashbackBlock />
        </section>
      ) : null}
      <UniquePromoListSection />
      <MembershipTiersInfoTabs />
      <MemberPrompt />
      <EarnedPointsPromptDrawer />
    </Frame>
  );
};

MembershipDetail.displayName = 'MembershipDetail';

export default MembershipDetail;
