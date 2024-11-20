import React, { useRef, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { searchUpdateDebounce } from '../../../../../../../common/utils/ui';
import { searchPromos } from '../../redux/thunks';
import Search from '../../../../../../../common/components/Input/Search';
import styles from './SearchReward.module.scss';

const SearchReward = () => {
  const searchInputRef = useRef(null);
  const { t } = useTranslation(['OrderingPromotion']);
  const dispatch = useDispatch();
  const [isChangingKeyword, setIsChangingKeyword] = useState(false);
  const handleChangeSearchKeyword = useCallback(
    searchKeyword => {
      setIsChangingKeyword(true);
      searchUpdateDebounce(searchKeyword, keyword => {
        dispatch(searchPromos(keyword));
        setIsChangingKeyword(false);
      });
    },
    [dispatch]
  );
  const handleClearSearchKeyword = useCallback(() => {
    dispatch(searchPromos(''));
  }, [dispatch]);

  useMount(() => {
    searchInputRef.current?.focus();
  });

  return (
    <section className={styles.SearchReward}>
      <Search
        allowClear
        ref={searchInputRef}
        placeholder={t('EnterPromoCodeHere')}
        searching={isChangingKeyword}
        onChangeInputValue={handleChangeSearchKeyword}
        onClearInput={handleClearSearchKeyword}
      />
    </section>
  );
};

SearchReward.displayName = 'SearchReward';

export default SearchReward;
