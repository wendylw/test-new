import React, { useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { backButtonClicked } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import Search from '../../../../../common/components/Input/Search';
import styles from './RewardList.module.scss';

const RewardList = () => {
  const searchInputRef = useRef(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  return (
    <Frame>
      <PageHeader
        className={styles.RewardListPageHeader}
        title={t('MyVouchersAndPromos')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <section>
        <Search
          allowClear
          ref={searchInputRef}
          placeholder={t('EnterPromoCodeHere')}
          onChangeInputValue={() => {}}
          onClearInput={() => {}}
        />
      </section>
    </Frame>
  );
};

RewardList.displayName = 'RewardList';

export default RewardList;
