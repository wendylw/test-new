import React from 'react';
import { useTranslation } from 'react-i18next';
import SearchEmptyImage from '../../../../../../../images/beep-no-results.svg';
import ResultContent from '../../../../../../../common/components/Result/ResultContent';
import styles from './EmptySearchResult.module.scss';

const EmptySearchResult = () => {
  const { t } = useTranslation(['OrderingPromotion']);

  return (
    <section className={styles.EmptySearchResult}>
      <ResultContent imageSrc={SearchEmptyImage} content={t('SearchRewardEmptyResult')} />
    </section>
  );
};

EmptySearchResult.displayName = 'EmptySearchResult';

export default EmptySearchResult;
