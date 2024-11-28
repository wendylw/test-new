import _isEmpty from 'lodash/isEmpty';
import React, { useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { REWARD_APPLIED_CODE_ERRORS } from '../../../../../../../common/utils/rewards/constants';
import { searchUpdateDebounce } from '../../../../../../../common/utils/ui';
import { getApplyRewardError } from '../../redux/selectors';
import { actions as rewardListActions } from '../../redux';
import { searchPromos } from '../../redux/thunks';
import Search from '../../../../../../../common/components/Input/Search';
import styles from './SearchReward.module.scss';

const SearchReward = () => {
  const searchInputRef = useRef(null);
  const { t } = useTranslation(['OrderingPromotion']);
  const dispatch = useDispatch();
  const [isChangingKeyword, setIsChangingKeyword] = useState(false);
  const applyRewardError = useSelector(getApplyRewardError);
  const handleChangeSearchKeyword = useCallback(
    searchKeyword => {
      const regex = /^[A-Z0-9]*$/;
      const isAvailableSearchKeyword = regex.test(searchKeyword);

      dispatch(
        rewardListActions.searchBoxErrorUpdate(
          isAvailableSearchKeyword ? '' : REWARD_APPLIED_CODE_ERRORS.ENTER_INVALID_PROMO_CODE
        )
      );
      dispatch(rewardListActions.setIsSearchBoxEmpty(_isEmpty(searchKeyword)));

      if (isAvailableSearchKeyword) {
        setIsChangingKeyword(true);
        searchUpdateDebounce(searchKeyword, keyword => {
          dispatch(searchPromos(keyword));
          setIsChangingKeyword(false);
        });
      }
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
        className={applyRewardError ? styles.SearchRewardSearchBox : null}
        placeholder={t('EnterPromoCodeHere')}
        valueFormatter={value => value.toUpperCase()}
        searching={isChangingKeyword}
        onChangeInputValue={handleChangeSearchKeyword}
        onClearInput={handleClearSearchKeyword}
      />
      <span className={styles.SearchRewardApplyErrorMessage}>{applyRewardError}</span>
    </section>
  );
};

SearchReward.displayName = 'SearchReward';

export default SearchReward;
