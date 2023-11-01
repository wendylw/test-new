/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/forbid-prop-types */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';
import StoreCard from './components/StoreCard';
import styles from './StoreList.module.scss';

class StoreList extends Component {
  renderStoreItems = () => {
    const { stores, onStoreClicked } = this.props;

    return (
      <>
        {(stores || []).map((store, index) => {
          const { id } = store || {};

          return (
            <div key={id} className={styles.StoreListItemWrapper}>
              <StoreCard
                store={store}
                data-test-id="site.common.store-item"
                onClick={onStoreClicked.bind(this, store, index)}
              />
            </div>
          );
        })}
      </>
    );
  };

  renderWithInfiniteScroll = () => {
    const { hasMore, loadMoreStores, getScrollParent, stores } = this.props;

    if (!stores || !stores.length) {
      return null;
    }

    return (
      <InfiniteScroll
        element="ul"
        loader={<div key="loading-0" className="store-card-list__loader loader theme text-size-biggest" />}
        pageStart={0} // to count from page0, page1, ...
        initialLoad={false}
        hasMore={hasMore}
        loadMore={page => loadMoreStores(page)}
        getScrollParent={getScrollParent}
        useWindow={false}
      >
        {this.renderStoreItems()}
      </InfiniteScroll>
    );
  };

  renderStoreList = () => <ul>{this.renderStoreItems()}</ul>;

  render() {
    const { withInfiniteScroll } = this.props;

    if (withInfiniteScroll) {
      return this.renderWithInfiniteScroll();
    }

    return this.renderStoreList();
  }
}

StoreList.displayName = 'StoreList';

StoreList.propTypes = {
  stores: PropTypes.array,
  hasMore: PropTypes.bool,
  loadMoreStores: PropTypes.func,
  getScrollParent: PropTypes.func,
  onStoreClicked: PropTypes.func,
  withInfiniteScroll: PropTypes.bool,
};

StoreList.defaultProps = {
  stores: [],
  hasMore: false,
  loadMoreStores: () => {},
  getScrollParent: () => {},
  onStoreClicked: () => {},
  withInfiniteScroll: false,
};

export default withTranslation()(StoreList);
