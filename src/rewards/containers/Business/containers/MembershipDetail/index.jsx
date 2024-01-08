import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { getClassName } from '../../../../../common/utils/ui';
import { mounted, backButtonClicked } from './redux/thunks';
import { getShouldShowBackButton } from './redux/selectors';
import { getIsWebview, getIsTNGMiniProgram } from '../../../../redux/modules/common/selectors';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import MemberCard from './components/MemberCard';
import CashbackBlock from './components/CashbackBlock';
import UniquePromoList from './components/UniquePromoList';
import MembershipDetailFooter from './components/MembershipDetailFooter';
import MemberPrompt from './components/MemberPrompt';
import styles from './MembershipDetail.module.scss';

const MembershipDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isWebview = useSelector(getIsWebview);
  const isTNGMiniProgram = useSelector(getIsTNGMiniProgram);
  const isWeb = !isWebview && !isTNGMiniProgram;
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
        title={t('MembershipDetailPageTitle')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <MemberCard />
      <CashbackBlock />
      <UniquePromoList />
      <MembershipDetailFooter />
      <MemberPrompt />
    </Frame>
  );
};

MembershipDetail.displayName = 'MembershipDetail';

export default MembershipDetail;
