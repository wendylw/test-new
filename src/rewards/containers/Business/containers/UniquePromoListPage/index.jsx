import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import UniquePromoList from '../../components/UniquePromoList';
import styles from './UniquePromoListPage.module.scss';

const UniquePromoListPage = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader
        className={styles.UniquePromoListPagePageHeader}
        title={t('MyRewards')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <section className={styles.UniquePromoListPageContent}>
        <UniquePromoList />
      </section>
    </Frame>
  );
};

UniquePromoListPage.displayName = 'UniquePromoListPage';

export default UniquePromoListPage;
