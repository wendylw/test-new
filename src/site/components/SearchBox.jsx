import React from 'react';
import { IconClose, IconSearch } from '../../components/Icons';
import { withTranslation } from 'react-i18next';
import './SearchBox.scss';

class SearchBox extends React.Component {
  render() {
    const { t, keyword, handleSearchTextChange, handleClearSearchText } = this.props;
    return (
      <div className="common-search padding-top-bottom-small">
        <div className="form__group flex flex-middle">
          <IconSearch className="icon icon__small icon__default flex__shrink-fixed" />
          <input
            className="form__input"
            data-testid="inputStore"
            data-heap-name="site.search.search-box"
            autoFocus="autoFocus"
            type="type"
            placeholder={t('SearchRestaurantPlaceholder')}
            value={keyword}
            onChange={handleSearchTextChange}
          />
          <IconClose
            className="icon icon__normal icon__default flex__shrink-fixed"
            data-heap-name="site.search.search-box-clear-btn"
            onClick={handleClearSearchText}
            style={{ visibility: keyword ? 'visible' : 'hidden' }}
          />
        </div>
      </div>
    );
  }
}

export default withTranslation()(SearchBox);
