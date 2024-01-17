import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { closeWebView } from '../../../../../utils/native-methods';
import { getIsWeb, getIsWebview } from '../../../../redux/modules/common/selectors';
import { getIsClaimUniquePromoRequestFulfilled } from './redux/selectors';
import { mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import ClaimSuccess from './ClaimSuccess';
import ClaimUniquePromo from '.';

const ClaimUniquePromoProxy = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isWeb = useSelector(getIsWeb);
  const isWebview = useSelector(getIsWebview);
  const isClaimUniquePromoRequestFulfilled = useSelector(getIsClaimUniquePromoRequestFulfilled);
  const handleClickHeaderBackButton = useCallback(() => {
    if (isWebview) {
      closeWebView();
    }
  }, [isWebview]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader
        isShowBackButton={!isWeb}
        title={t('MembershipDetailPageTitle')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <ClaimUniquePromo />
      {isClaimUniquePromoRequestFulfilled && <ClaimSuccess />}
    </Frame>
  );
};

ClaimUniquePromoProxy.displayName = 'ClaimUniquePromo';

export default ClaimUniquePromoProxy;
