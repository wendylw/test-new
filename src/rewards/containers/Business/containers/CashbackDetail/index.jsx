import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { mounted, backButtonClicked } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import CashbackBlock from '../../components/CashbackBlock';
import MerchantInfo from './components/MerchantInfo';
import CashbackDetailFooter from './components/CashbackDetailFooter';

const CashbackDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader title={t('CashbackDetailPageTitle')} onBackArrowClick={handleClickHeaderBackButton} />
      <MerchantInfo />
      <CashbackBlock />
      <CashbackDetailFooter />
    </Frame>
  );
};

CashbackDetail.displayName = 'CashbackDetail';

export default CashbackDetail;
