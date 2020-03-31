import PropTypes from 'prop-types';
import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { withTranslation, Trans } from 'react-i18next';
import { IconMotorcycle } from '../../../components/Icons';
import Image from '../../../components/Image';
import Tag from '../../../components/Tag';

class StoreList extends Component {
  handleStoreClicked = store => {
    this.props.onStoreClicked(store);
  };

  render() {
    const { t, stores, hasMore, loadMoreStores } = this.props;
    const tagClassName = 'tag__card text-size-small text-weight-bold margin-smaller';
    const storeStatus = {
      open: {
        text: t('Open'),
        className: `${tagClassName} text-success`,
      },
      close: {
        text: t('Close'),
        className: `${tagClassName} text-success`,
      },
    };

    console.log('[StoreList] hasMore =', hasMore, 'stores =', stores);

    return (
      <InfiniteScroll
        className="store-card-list"
        element="ul"
        loader={<div key={'loading-0'} className="loader theme"></div>}
        hasMore={hasMore}
        loadMore={() => {
          if (hasMore) loadMoreStores();
        }}
        initialLoad={false /* to make client component to load the data for first time, this has bug to load now */}
      >
        {stores.map(store => {
          const { name, avatar, deliveryFee, minimumConsumption, isOpen, geoDistance, id } = store || {};
          const currentStoreStatus = storeStatus[isOpen ? 'open' : 'close'];

          return (
            <li
              key={id}
              className="store-card-list__item card"
              onClick={() => {
                console.log(`[StoreList] store[${id}] is clicked`);
                this.handleStoreClicked(store);
              }}
            >
              <Tag text={currentStoreStatus.text} className={currentStoreStatus.className} />
              <Image className="store-card-list__image card__image" src={avatar} alt="" />
              <summary className="padding-small">
                <div className="flex flex-middle flex-space-between">
                  <h3 className="store-card-list__title text-size-bigger text-weight-bold">{name}</h3>
                  <span className="text-opacity">{(geoDistance || 0).toFixed(2)} km</span>
                </div>
                <ul className="store-info padding-top-small">
                  <li className="store-info__item text-middle">
                    <IconMotorcycle className="icon icon__smaller text-middle" />
                    <span className="store-info__text text-size-small text-middle">{deliveryFee}</span>
                  </li>
                  <li className="store-info__item text-middle">
                    <Trans i18nKey="MinimumOrder" minimumConsumption={minimumConsumption}>
                      <label className="text-size-small text-middle">Min Order.</label>
                      <span className="store-info__text text-size-small text-middle">{minimumConsumption}</span>
                    </Trans>
                  </li>
                </ul>
              </summary>
            </li>
          );
        })}
      </InfiniteScroll>
    );
  }
}

StoreList.propTypes = {
  stores: PropTypes.array,
  hasMore: PropTypes.bool,
  loadMoreStores: PropTypes.func,
  onStoreClicked: PropTypes.func,
};

StoreList.defaultProps = {
  stores: [],
  loadMoreStores: () => {},
  onStoreClicked: () => {},
};

export default withTranslation()(StoreList);
