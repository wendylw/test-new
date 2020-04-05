import PropTypes from 'prop-types';
import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { withTranslation, Trans } from 'react-i18next';
import { IconMotorcycle, IconLocation, IconLabelOutline } from '../../../components/Icons';
import Image from '../../../components/Image';
import CurrencyNumber from '../../components/CurrencyNumber';
import MvpStorePlaceholderImage from '../../../images/mvp-store-placeholder.jpg';

class StoreList extends Component {
  handleStoreClicked = store => {
    this.props.onStoreClicked(store);
  };

  renderStoreItems = () => {
    // const tagClassName = 'tag__card text-size-small text-weight-bold margin-normal';
    const { t, stores } = this.props;

    // const storeStatus = {
    //   open: {
    //     text: t('Open'),
    //     className: `${tagClassName} text-success`,
    //   },
    //   close: {
    //     text: t('Closed'),
    //     className: `${tagClassName} text-error`,
    //   },
    // };

    return (
      <React.Fragment>
        {stores.map(store => {
          const {
            name,
            avatar,
            deliveryFee,
            minimumConsumption,
            isOpen,
            geoDistance,
            id,
            locale,
            currency,
            isOutOfDeliveryRange,
          } = store || {};
          // const currentStoreStatus = storeStatus[isOpen ? 'open' : 'close'];

          return (
            <li
              key={id}
              className="store-card-list__item flex flex-top padding-top-bottom-normal border__bottom-divider"
              onClick={() => {
                console.log(`[StoreList] store[${id}] is clicked`);
                this.handleStoreClicked(store);
              }}
            >
              <div className="store-card-list__image-container border-radius-large">
                {isOpen ? null : (
                  <div className="store-card-list__image-cover flex flex-middle flex-center text-center text-weight-bold">
                    {t('ClosedForNow')}
                  </div>
                )}
                <Image
                  className="store-card-list__image card__image"
                  src={avatar}
                  placeholderImage={MvpStorePlaceholderImage}
                  scalingRatioIndex={1}
                  alt={name}
                />
              </div>
              <summary className="store-card-list__summary padding-left-right-small">
                <h3 className="store-card-list__title text-size-bigger text-weight-bold text-omit__single-line">
                  {name}
                </h3>
                <ul className="store-info padding-top-bottom-smaller">
                  <li className="store-info__item text-middle">
                    <IconLocation className="icon icon__smaller text-middle" />
                    <span className="store-info__text text-size-small text-middle">
                      {t('DistanceText', { distance: (geoDistance || 0).toFixed(2) })}
                    </span>
                  </li>
                  <li className="store-info__item text-middle">
                    <IconMotorcycle className="icon icon__smaller text-middle" />
                    <CurrencyNumber
                      className="store-info__text text-size-small text-middle"
                      locale={locale}
                      currency={currency}
                      price={deliveryFee}
                    />
                  </li>
                </ul>
                <div className="store-card-list__description text-opacity">
                  <Trans i18nKey="MinimumOrder">
                    <label className="text-size-small text-middle">Min Order.</label>
                    <CurrencyNumber
                      className="store-info__text text-size-small text-middle"
                      locale={locale}
                      currency={currency}
                      price={minimumConsumption}
                    />
                  </Trans>
                </div>
                {!isOutOfDeliveryRange ? null : (
                  <div className="padding-top-bottom-small">
                    <IconLabelOutline className="icon icon__privacy icon__smaller text-middle" />
                    <span className="store-info__text text-size-small text-middle">{t('SelfPickupOnly')}</span>
                  </div>
                )}
              </summary>
            </li>
          );
        })}
      </React.Fragment>
    );
  };

  renderWithInfiniteScroll = () => {
    const { hasMore, loadMoreStores, getScrollParent } = this.props;

    return (
      <InfiniteScroll
        className="store-card-list"
        element="ul"
        loader={<div key={'loading-0'} className="loader theme text-size-huge"></div>}
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
