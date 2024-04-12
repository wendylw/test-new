import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import RewardsEmptyListImage from '../../../../../images/rewards-empty-list-icon.svg';
import { getIsUniquePromoListEmpty } from '../../redux/common/selectors';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import { ObjectFitImage } from '../../../../../common/components/Image';
import PageHeader from '../../../../../common/components/PageHeader';
import UniquePromoList from '../../components/UniquePromoList';
import styles from './UniquePromoListPage.module.scss';

const UniquePromoListPage = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isUniquePromoListEmpty = useSelector(getIsUniquePromoListEmpty);
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
      {isUniquePromoListEmpty ? (
        <section className={styles.UniquePromoListEmptySection}>
          <div className={styles.UniquePromoListEmptyImage}>
            <ObjectFitImage noCompression src={RewardsEmptyListImage} />
          </div>
          <h4 className={styles.UniquePromoListEmptyTitle}>{t('UniquePromoListEmptyTitle')}</h4>
        </section>
      ) : (
        <section className={styles.UniquePromoListPageContent}>
          <UniquePromoList />
        </section>
      )}
    </Frame>
  );
};

UniquePromoListPage.displayName = 'UniquePromoListPage';

export default UniquePromoListPage;
