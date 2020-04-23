import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';
import {
  IconAttachMoney,
  IconBookmark,
  IconLocalOffer,
  /*IconMotorcycle,*/
  IconLocation,
} from '../../../components/Icons';
import Image from '../../../components/Image';
import MvpStorePlaceholderImage from '../../../images/mvp-store-placeholder.jpg';
import CurrencyNumber from '../../components/CurrencyNumber';

class StoreList extends Component {
  handleStoreClicked = store => {
    this.props.onStoreClicked(store);
  };

  renderClosedStoreTag = enablePreOrder => {
    const { t } = this.props;
    return enablePreOrder ? (
      <div className="store-card-list__image-cover">
        <label className="store-card-list__tag tag tag__small tag__privacy text-uppercase text-weight-bolder">
          {t('PreOrderTag')}
        </label>
      </div>
    ) : (
      <div className="store-card-list__image-cover flex flex-middle flex-center text-center text-weight-bolder">
        {t('ClosedForNow')}
      </div>
    );
  };

  renderStoreItems = () => {
    // const tagClassName = 'tag__card text-size-small text-weight-bolder margin-normal';
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
            minimumSpendForFreeDelivery,
            isOpen,
            geoDistance,
            id,
            locale,
            currency,
            isOutOfDeliveryRange,
            enableFreeShipping,
            enableCashback,
            enablePreOrder,
            cashbackRate,
          } = store || {};
          const cashbackRatePercentage = (Number(cashbackRate) || 0) * 100;
          // const currentStoreStatus = storeStatus[isOpen ? 'open' : 'close'];

          return (
            <li
              key={id}
              className="store-card-list__item flex flex-top padding-top-bottom-normal border__bottom-divider"
              onClick={() => {
                this.handleStoreClicked(store);
              }}
            >
              <div className="store-card-list__image-container flex__shrink-fixed border-radius-large">
                {isOpen ? null : this.renderClosedStoreTag(enablePreOrder)}
                <Image
                  className="store-card-list__image card__image"
                  src={avatar}
                  placeholderImage={MvpStorePlaceholderImage}
                  scalingRatioIndex={1}
                  alt={name}
                />
              </div>
              <summary className="store-card-list__summary padding-left-right-small">
                <h3 className="store-card-list__title text-size-bigger text-weight-bolder text-omit__single-line">
                  {name}
                </h3>
                <ul className="store-info">
                  <li className="store-info__item text-middle">
                    <IconLocation className="icon icon__smaller text-middle" />
                    <span className="store-info__text text-size-small text-middle">
                      {t('DistanceText', { distance: (geoDistance || 0).toFixed(2) })}
                    </span>
                  </li>
                  {isOutOfDeliveryRange ? (
                    <li className="store-info__item text-middle">
                      <IconBookmark className="icon icon__smaller text-middle" />
                      <span className="store-info__text text-size-small text-middle">{t('SelfPickupOnly')}</span>
                    </li>
                  ) : null
                  /*(
                            <li className="store-info__item text-middle">
                              <IconMotorcycle className="icon icon__smaller text-middle" />
                              <CurrencyNumber
                                className="store-info__text text-size-small text-middle"
                                locale={locale}
                                currency={currency}
                                price={deliveryFee}
                              />
                            </li>
                          )*/
                  }
                </ul>
                {enableCashback && cashbackRate ? (
                  <div className="flex flex-middle">
                    <IconAttachMoney className="store-info__icon-small icon icon__privacy icon__small text-middle" />
                    <span className="store-info__text text-size-small text-middle text-capitalize">
                      {t('EnabledCashbackText', { cashbackRate: Math.round(cashbackRatePercentage * 100) / 100 })}
                    </span>
                  </div>
                ) : null}
                {enableFreeShipping && deliveryFee ? (
                  <div className="flex flex-middle">
                    <IconLocalOffer className="icon icon__privacy icon__smaller text-middle" />
                    <Trans i18nKey="MvpFreeDeliveryPrompt" minimumSpendForFreeDelivery={minimumSpendForFreeDelivery}>
                      <span className="store-info__text text-size-small text-middle">
                        Free Delivery above
                        <CurrencyNumber
                          className="text-size-small"
                          locale={locale}
                          currency={currency}
                          price={minimumSpendForFreeDelivery}
                        />
                      </span>
                    </Trans>
                  </div>
                ) : null}
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
        loader={<div key={'loading-0'} className="store-card-list__loader loader theme text-size-biggest"></div>}
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
