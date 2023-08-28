import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import CleverTap from '../../../utils/clevertap';
import styles from './EmptySearch.module.scss';

class EmptySearch extends Component {
  handleClick = urlPath => {
    const { history } = this.props;
    history.push({ pathname: `/collections/${urlPath}`, state: { from: '/search' } });
  };

  renderPopularCategories() {
    const { t, populars } = this.props;
    return (
      <div className={styles.EmptySearchCategoryWrapper}>
        <h2 className={styles.EmptySearchPopularCategoryTitle}>{t('PopularCategories')}</h2>
        <div className="tw-flex tw-flex-wrap">
          {(populars || []).map((collection, index) => {
            const { name, urlPath } = collection || {};

            return (
              <span
                role="button"
                tabIndex="0"
                key={urlPath}
                className={styles.EmptySearchPopularCategoryContent}
                onClick={() => {
                  CleverTap.pushEvent('Empty Search - Click popular category', {
                    'collection name': name,
                    rank: index + 1,
                  });
                  this.handleClick(urlPath);
                }}
                data-test-id="site.search.popular-categories"
              >
                {name}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  renderOtherItems = () => {
    const { others } = this.props;

    return (
      <div>
        {(others || []).map((collection, index) => {
          const { name, urlPath } = collection || {};

          return (
            <li
              key={urlPath}
              className={styles.EmptySearchOtherCategoryContainer}
              onClick={() => {
                CleverTap.pushEvent('Empty Search - Click other category', {
                  'collection name': name,
                  rank: index + 1,
                });
                this.handleClick(urlPath);
              }}
              data-test-id="site.search.other-categories"
            >
              <span className={styles.EmptySearchCategoryContent}>{name}</span>
            </li>
          );
        })}
      </div>
    );
  };

  renderOtherCategories() {
    const { t, hasMore, getScrollParent, loadCollections, others } = this.props;

    return (
      <div className={styles.EmptySearchCategoryWrapper}>
        <h2 className={styles.EmptySearchCategoryTitle}>{t('OtherCategories')}</h2>
        <ul className="sm:tw-mx-4px tw-mx-4">
          {!others || !others.length ? null : (
            <InfiniteScroll
              className="store-card-list"
              element="ul"
              loader={<div key="loading-0" className="store-card-list__loader loader theme text-size-biggest" />}
              pageStart={0}
              initialLoad={false}
              hasMore={hasMore}
              loadMore={page => loadCollections(page)}
              getScrollParent={getScrollParent}
              useWindow={false}
            >
              {this.renderOtherItems()}
            </InfiniteScroll>
          )}
        </ul>
      </div>
    );
  }

  render() {
    const { populars, others } = this.props;
    return (
      <div className={styles.EmptySearchWrapper}>
        {populars && populars.length > 0 && this.renderPopularCategories()}
        {others && others.length > 0 && this.renderOtherCategories()}
      </div>
    );
  }
}

EmptySearch.displayName = 'EmptySearch';

EmptySearch.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  populars: PropTypes.array,
  others: PropTypes.array,
  /* eslint-enable */
  hasMore: PropTypes.bool,
  getScrollParent: PropTypes.func,
  loadCollections: PropTypes.func,
};

EmptySearch.defaultProps = {
  populars: [],
  others: [],
  hasMore: false,
  getScrollParent: () => {},
  loadCollections: () => {},
};

export default withRouter(withTranslation('SiteHome')(EmptySearch));
