import React from 'react';
import { MagnifyingGlass, XCircle } from 'phosphor-react';
import { withTranslation } from 'react-i18next';
import styles from './SearchBox.module.scss';

class SearchBox extends React.Component {
  render() {
    const { t, keyword, handleSearchTextChange, handleClearSearchText } = this.props;
    return (
      <div className={styles.SearchBoxContainer}>
        <MagnifyingGlass className={styles.SearchBoxGlassIcon} size={20} weight="light" />
        <input
          className={styles.SearchBoxInput}
          data-testid="inputStore"
          data-test-id="site.search.search-box"
          autoFocus="autoFocus"
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
  }
}
SearchBox.displayName = 'SearchBox';

export default withTranslation()(SearchBox);
