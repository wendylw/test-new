import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';
import _get from 'lodash/get';
import {
  IconLocalOffer,
  /*IconMotorcycle,*/
  IconLocation,
  IconWallet,
  IconStar,
} from '../../../components/Icons';
import Image from '../../../components/Image';
import MvpStorePlaceholderImage from '../../../images/mvp-store-placeholder.jpg';
import CurrencyNumber from '../../components/CurrencyNumber';
import Tag from '../../../components/Tag';

class StoreList extends Component {
  handleStoreClicked = store => {
    this.props.onStoreClicked(store);
  };

  renderPromotionTags = promoTag => {
    return (
      <div className="store-card-list__tag-cover">
        <div className="store-card-list__promo-tag">
          <span className="padding-smaller text-size-small text-uppercase text-weight-bolder">{promoTag}</span>
        </div>
      </div>
    );
  };

  renderClosedStoreTag = enablePreOrder => {
    const { t } = this.props;
    return enablePreOrder ? (
      <div className="store-card-list__image-cover">
        <label className="store-card-list__tag text-size-small text-uppercase text-weight-bolder">
          <Tag className="tag tag__small tag__primary" text={t('PreOrder')} />
        </label>
      </div>
    ) : (
      <div className="store-card-list__image-cover flex flex-middle flex-center text-center text-line-height-base text-weight-bolder">
        {t('ClosedForNow')}
      </div>
    );
  };

  renderStoreItems = () => {
    const { t, stores } = this.props;

    return (
      <React.Fragment>
        {(stores || []).map((store, index) => {
          const {
            name,
            storeDisplayName,
            avatar,
            deliveryFee,
            minimumSpendForFreeDelivery,
            isOpen,
            geoDistance,
            id,
            searchingTags,
            locale,
            currency,
            enableFreeShipping,
            enableCashback,
            enablePreOrder,
            cashbackRate,
            products,
            reviewInfo,
            storePromoTags,
          } = store || {};
          const cashbackRatePercentage = (Number(cashbackRate) || 0) * 100;

          const rating = _get(reviewInfo, 'rating', '');

          return (
            <li
              key={id}
              className="store-card-list__item flex flex-top padding-top-bottom-normal border__bottom-divider"
              data-testid="deliverStore"
              data-heap-name="site.common.store-item"
              data-heap-store-name={name}
              data-heap-store-index={index}
              onClick={() => {
                this.handleStoreClicked(store);
              }}
            >
              <div className="store-card-list__image-container flex__shrink-fixed border-radius-large">
                {isOpen ? null : this.renderClosedStoreTag(enablePreOrder)}
                {storePromoTags[0] && this.renderPromotionTags(storePromoTags[0])}
                <Image
                  className="store-card-list__image card__image"
                  src={avatar}
                  scalingRatioIndex={1}
                  placeholderImage={MvpStorePlaceholderImage}
                  alt={name}
                />
              </div>
              <summary
                className={`store-card-list__summary padding-left-right-small ${
                  isOpen || enablePreOrder ? '' : 'text-opacity'
                }`}
              >
                <h3 className="store-card-list__title text-size-bigger text-weight-bolder text-omit__single-line">
                  {storeDisplayName || name}
                </h3>
                {searchingTags.length > 0 && (
                  <div className="padding-left-right-smaller">
                    <span className="text-size-smaller store-card-list__tags-text text-omit__single-line">
                      {(searchingTags || []).join(', ')}
                    </span>
                  </div>
                )}
                <ul className="store-info">
                  {rating && (
                    <li className="store-info__item text-middle">
                      <IconStar className="icon icon__primary icon__smaller text-middle" />
                      <span className="store-info__text text-primary text-size-small text-middle text-weight-bolder text-line-height-base">
                        {rating}
                      </span>
                    </li>
                  )}
                  <li className="store-info__item text-middle">
                    <IconLocation className="icon icon__smaller text-middle" />
                    <span className="store-info__text text-size-small text-middle text-line-height-base">
                      {t('DistanceText', { distance: (geoDistance || 0).toFixed(2) })}
                    </span>
                  </li>
                </ul>
                {enableCashback && cashbackRate ? (
                  <div className="flex flex-middle">
                    <IconWallet className="icon icon__smaller text-middle" />
                    <span className="store-info__text text-size-small text-middle text-line-height-base text-capitalize">
                      {t('EnabledCashbackText', { cashbackRate: Math.round(cashbackRatePercentage * 100) / 100 })}
                    </span>
                  </div>
                ) : null}
                {enableFreeShipping && deliveryFee ? (
                  <div className="flex flex-middle">
                    <IconLocalOffer className="icon icon__smaller text-middle" />
                    <Trans i18nKey="MvpFreeDeliveryPrompt" minimumSpendForFreeDelivery={minimumSpendForFreeDelivery}>
                      <span className="store-info__text text-size-small text-middle text-line-height-base">
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
                {products.length > 0 && (
                  <div className="flex padding-top-bottom-small">
                    {(products || []).map(product => {
                      const { id, title, images, price } = product;
                      return (
                        <div className="flex flex-column padding-left-right-smaller" key={id}>
                          <Image className="store-card-list__product-image" src={images[0]} />
                          <summary
                            className="padding-left-right-smaller margin-top-bottom-smaller"
                            style={{ width: 65 }}
                          >
                            <span className="store-card-list__product-title padding-top-bottom-smaller text-size-small text-omit__single-line">
                              {title}
                            </span>
                            <span className="store-card-list__product-price font-weight-bolder">
                              {Math.floor(price * 100) / 100}
                            </span>
                          </summary>
                        </div>
                      );
                    })}
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
    const { hasMore, loadMoreStores, getScrollParent, stores } = this.props;

    if (!stores || !stores.length) {
      return null;
    }

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
