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

  renderStoreItems = () => {
    const tagClassName = 'tag__card text-size-small text-weight-bold margin-smaller';
    const { t, stores } = this.props;

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

    return (
      <>
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
      </>
    );
  };

  renderWithInfiniteScroll = () => {
    const { hasMore, loadMoreStores, getScrollParent } = this.props;

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
        {this.renderStoreItems()}
      </InfiniteScroll>
    );
  };

  renderStoreList = () => {
    return <ul className="store-card-list">{this.renderStoreItems()}</ul>;
  };

  render() {
    const { withInfiniteScroll } = this.props;

    if (withInfiniteScroll) {
      return this.renderWithInfiniteScroll();
    }

    return this.renderStoreList();
  }
}

StoreList.propTypes = {
  stores: PropTypes.array.isRequired,
  hasMore: PropTypes.bool,
  loadMoreStores: PropTypes.func,
  getScrollParent: PropTypes.func,
  onStoreClicked: PropTypes.func,
  withInfiniteScroll: PropTypes.bool,
};

StoreList.defaultProps = {
  stores: [],
  loadMoreStores: () => {},
  getScrollParent: () => {},
  onStoreClicked: () => {},
  withInfiniteScroll: false,
};

export default withTranslation()(StoreList);
