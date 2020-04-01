import PropTypes from 'prop-types';
import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { withTranslation, Trans } from 'react-i18next';
import { IconMotorcycle } from '../../../components/Icons';
import Image from '../../../components/Image';
import Tag from '../../../components/Tag';
import CurrencyNumber from '../../components/CurrencyNumber';

class StoreList extends Component {
  handleStoreClicked = store => {
    this.props.onStoreClicked(store);
  };

  render() {
    const { t, stores, hasMore, loadMoreStores, getScrollParent } = this.props;
    const tagClassName = 'tag__card text-size-small text-weight-bold margin-smaller';
    const storeStatus = {
      open: {
        text: t('Open'),
        className: `${tagClassName} text-success`,
      },
      close: {
        text: t('Close'),
        className: `${tagClassName} text-error`,
      },
    };

    console.log('[StoreList] hasMore =', hasMore, 'stores =', stores);

    // todo: scroll parent may need to specify
    return (
      <InfiniteScroll
        className="store-card-list"
        element="ul"
        loader={<div key={'loading-0'} className="loader theme"></div>}
        pageStart={-1} // to count from page0, page1, ...
        hasMore={hasMore}
        loadMore={page => loadMoreStores(page)}
        getScrollParent={getScrollParent}
        useWindow={false}
      >
        {stores.map(store => {
          const { name, avatar, deliveryFee, minimumConsumption, isOpen, geoDistance, id, locale, currency } =
            store || {};
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
              <Image className="store-card-list__image card__image" src={avatar} scalingRatioIndex={1} alt={name} />
              <summary className="padding-small">
                <div className="flex flex-middle flex-space-between">
                  <h3 className="store-card-list__title text-size-bigger text-weight-bold">{name}</h3>
                  <span className="text-opacity">{t('DistanceText', { distance: (geoDistance || 0).toFixed(2) })}</span>
                </div>
                <ul className="store-info padding-top-small">
                  <li className="store-info__item text-middle">
                    <IconMotorcycle className="icon icon__smaller text-middle" />
                    <CurrencyNumber
                      className="store-info__text text-size-small text-middle"
                      locale={locale}
                      currency={currency}
                      price={deliveryFee}
                    />
                  </li>
                  <li className="store-info__item text-middle">
                    <Trans i18nKey="MinimumOrder">
                      <label className="text-size-small text-middle">Min Order.</label>
                      <CurrencyNumber
                        className="store-info__text text-size-small text-middle"
                        locale={locale}
                        currency={currency}
                        price={minimumConsumption}
                      />
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
  getScrollParent: PropTypes.func,
  onStoreClicked: PropTypes.func,
};

StoreList.defaultProps = {
  stores: [],
  loadMoreStores: () => {},
  getScrollParent: () => {},
  onStoreClicked: () => {},
};

export default withTranslation()(StoreList);
