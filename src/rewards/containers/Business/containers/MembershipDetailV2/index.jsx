import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { getMerchantDisplayName } from '../../../../../redux/modules/merchant/selectors';
import { mounted, backButtonClicked } from './redux/thunks';
import { getShouldShowBackButton } from './redux/selectors';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import styles from './MembershipDetail.module.scss';

const MembershipDetail = () => {
  const dispatch = useDispatch();
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const shouldShowBackButton = useSelector(getShouldShowBackButton);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader
        className={styles.MembershipDetailPageHeader}
        leftContentClassName={styles.MembershipDetailPageHeaderLeftContent}
        titleClassName={styles.MembershipDetailPageHeaderTitle}
        isShowBackButton={shouldShowBackButton}
        title={merchantDisplayName}
        onBackArrowClick={handleClickHeaderBackButton}
      />
    </Frame>
  );
};

MembershipDetail.displayName = 'MembershipDetail';

export default MembershipDetail;
