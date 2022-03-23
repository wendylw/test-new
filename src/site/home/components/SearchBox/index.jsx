import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass } from 'phosphor-react';
import { homeActionCreators as homeActions } from '../../../redux/modules/home';
import CleverTap from '../../../../utils/clevertap';
import styles from './SearchBox.module.scss';

const SearchBox = ({ onClick }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const clickSearchBoxHandler = useCallback(() => {
    CleverTap.pushEvent('Homepage - Click Search Bar');
    dispatch(homeActions.goToSearchPage());
    onClick();
  }, [dispatch, onClick]);

  return (
    <div className="sm:tw-mt-16px tw-mt-16 sm:tw-mb-8px tw-mb-8 sm:tw-mx-16px tw-mx-16">
      <button
        className={styles.SearchBoxContainer}
        data-testid="searchStore"
        data-heap-name="site.home.search-box"
        onClick={clickSearchBoxHandler}
      >
        <MagnifyingGlass
          className="tw-flex-shrink-0 tw-text-2xl tw-text-gray sm:tw-ml-16px tw-ml-16 sm:tw-my-8px tw-my-8 sm:tw-mr-4px w-mr-4"
          weight="light"
        />
        <input className={styles.SearchBoxInput} type="type" placeholder={t('SearchRestaurantPlaceholder')} />
      </button>
    </div>
  );
};

SearchBox.displayName = 'SearchBox';

SearchBox.propTypes = {
  onClick: PropTypes.func,
};

SearchBox.defaultProps = {
  onClick: () => {},
};

export default SearchBox;
