import React from 'react';
import PropTypes from 'prop-types';
import { MagnifyingGlass, XCircle } from 'phosphor-react';
import { withTranslation } from 'react-i18next';
import styles from './SearchBox.module.scss';

const SearchBox = ({ t, keyword, handleSearchTextChange, handleClearSearchText }) => (
  <div className={styles.SearchBoxContainer}>
    <MagnifyingGlass className={styles.SearchBoxGlassIcon} size={20} weight="light" />
    <input
      className={styles.SearchBoxInput}
      data-test-id="site.search.search-box"
      type="type"
      placeholder={t('SearchRestaurantPlaceholder')}
      value={keyword}
      onChange={handleSearchTextChange}
    />
    <button
      className={styles.SearchBoxCloseIconWrapper}
      data-test-id="site.search.search-box-clear-btn"
      onClick={handleClearSearchText}
      style={{ visibility: keyword ? 'visible' : 'hidden' }}
    >
      <XCircle className={styles.SearchBoxCloseIcon} size={20} weight="fill" />
    </button>
  </div>
);

SearchBox.displayName = 'SearchBox';

SearchBox.propTypes = {
  keyword: PropTypes.string,
  handleClearSearchText: PropTypes.func,
  handleSearchTextChange: PropTypes.func,
};

SearchBox.defaultProps = {
  keyword: '',
  handleClearSearchText: () => {},
  handleSearchTextChange: () => {},
};

export default withTranslation()(SearchBox);
