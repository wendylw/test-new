import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass } from 'phosphor-react';
import styles from './SearchBox.module.scss';

const SearchBox = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <div className="sm:tw-mt-16px tw-mt-16 sm:tw-mb-8px tw-mb-8">
      <button className={styles.SearchBoxContainer} data-test-id="site.home.search-box" onClick={onClick}>
        <MagnifyingGlass className={styles.SearchBoxIcon} weight="light" />
        <span className={styles.SearchBoxContent}>{t('SearchRestaurantPlaceholder')}</span>
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
