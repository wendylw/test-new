import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Search from '../../../../../../../common/components/Input/Search';
import styles from './SearchReward.module.scss';

const SearchReward = () => {
  const searchInputRef = useRef(null);
  const { t } = useTranslation();

  return (
    <section className={styles.SearchReward}>
      <Search
        allowClear
        ref={searchInputRef}
        placeholder={t('EnterPromoCodeHere')}
        onChangeInputValue={() => {}}
        onClearInput={() => {}}
      />
    </section>
  );
};

SearchReward.displayName = 'SearchReward';

export default SearchReward;
