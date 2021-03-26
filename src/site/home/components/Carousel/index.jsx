import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import SwiperCore, { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { withRouter } from 'react-router-dom';
import _get from 'lodash/get';
import Image from '../../../../components/Image';
import MvpStorePlaceholderImage from '../../../../images/mvp-store-placeholder.jpg';
import { IconLocalOffer, IconWallet, IconNext, IconStar } from '../../../../components/Icons';
import 'swiper/swiper.scss';
import './index.scss';
import { submitStoreMenu } from '../../utils';
import Tag from '../../../../components/Tag';
import CleverTap from '../../../../utils/clevertap';

SwiperCore.use([Autoplay]);

class Carousel extends Component {
  handleStoreClicked = async (store, shippingType) => {
    let type;
    const { currentPlaceInfo } = this.props;
    if (shippingType.includes('Delivery')) {
      type = 'delivery';
    } else {
      type = 'pickup';
    }
    await submitStoreMenu({
      deliveryAddress: currentPlaceInfo,
      store: store,
      source: document.location.href,
      shippingType: type,
    });
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

  renderPromotionTags = promoTag => {
    return (
      <div className="store-card-list__tag-cover">
        <div className="store-card-list__promo-tag">
          <span className="padding-smaller text-size-small text-uppercase text-weight-bolder">{promoTag}</span>
        </div>
      </div>
    );
  };

  renderCarouselStores(stores, shippingType, collectionInfo) {
    const { t } = this.props;
    return (
      <Swiper className="carousel__wrapper margin-top-bottom-normal" slidesPerView={'auto'}>
        {(stores || []).map((store, index) => {
          const {
            name,
            avatar,
            deliveryFee,
            isOpen,
            id,
            enableFreeShipping,
            enableCashback,
            enablePreOrder,
            cashbackRate,
            reviewInfo,
            promoTag,
            shippingType: storeShippingType,
          } = store || {};

          const rating = _get(reviewInfo, 'rating', '');

          const cashbackRatePercentage = (Number(cashbackRate) || 0) * 100;

          return (
            <SwiperSlide
              key={id}
              className="carousel__item margin-top-bottom-smaller margin-left-right-small border-radius-large flex flex-column flex-space-between"
              data-heap-name="site.home.carousel.store-item"
              data-heap-store-name={name}
              onClick={() => {
                CleverTap.pushEvent('Homepage - Click Carousel Store Card', {
                  'collection name': collectionInfo.name,
                  'collection rank': collectionInfo.index,
                  'store name': name,
                  'store rank': index + 1,
                  'shipping type': storeShippingType,
                  'has promo': promoTag?.length > 0,
                  cashback: store.cashbackRate || 0,
                });
                this.handleStoreClicked(store, shippingType);
              }}
            >
              <summary
                className={`carousel__item-summary text-size-reset ${isOpen || enablePreOrder ? '' : 'text-opacity'}`}
              >
                <div className="carousel__image-container">
                  {isOpen ? null : this.renderClosedStoreTag(enablePreOrder)}
                  {promoTag && this.renderPromotionTags(promoTag)}
                  <Image
                    className="carousel-store__image card__image"
                    src={avatar}
                    scalingRatioIndex={1}
                    placeholderImage={MvpStorePlaceholderImage}
                    alt={name}
                  />
                </div>
                <h3 className="carousel__item-title padding-left-right-small margin-top-bottom-smaller text-size-big text-weight-bolder text-line-height-base text-omit__single-line">
                  {name}
                </h3>
                <div className="carousel__item-info">
                  {enableCashback && cashbackRate ? (
                    <div className="flex flex-middle padding-left-right-smaller">
                      <IconWallet className="icon icon__smaller" />
                      <span className="text-size-small text-line-height-base text-capitalize">
                        {t('EnabledCashbackText', {
                          cashbackRate: Math.round(cashbackRatePercentage * 100) / 100,
                        })}
                      </span>
                    </div>
                  ) : null}

                  {enableFreeShipping && deliveryFee ? (
                    <div className="flex flex-middle padding-left-right-smaller">
                      <IconLocalOffer className="icon icon__smaller" />
                      <span className="text-size-small text-line-height-base">{t('MvpFreeDeliveryPrompt')}</span>
                    </div>
                  ) : null}
                </div>
              </summary>
              <div
                className={`carousel__item-footer padding-left-right-small ${
                  isOpen || enablePreOrder ? '' : 'text-opacity'
                }`}
              >
                {rating && (
                  <div className="flex flex-middle flex-end">
                    <IconStar className="icon icon__primary icon__smaller" />
                    <span className="carousel__item-rating-text text-primary text-size-small text-weight-bolder text-line-height-base">
                      {rating}
                    </span>
                  </div>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    );
  }

  render() {
    const { collections, t } = this.props;
    return (
      <div className="margin-top-bottom-normal">
        {(collections || []).map((item, index) => {
          const { name, stores, urlPath, beepCollectionId, shippingType } = item;
          return (
            <section
              key={beepCollectionId}
              data-heap-name="site.home.carousel.container"
              data-heap-collection-name={name}
            >
              <div className="flex flex-space-between flex-middle padding-left-right-normal">
                <h3 className="text-size-bigger text-weight-bolder">{name}</h3>
                <span
                  className="carousel__see-all flex flex-middle"
                  data-heap-name="site.home.carousel.see-all-btn"
                  onClick={() => {
                    CleverTap.pushEvent('Homepage - Click Carousel See All', {
                      'collection name': name,
                      'collection id': beepCollectionId,
                      rank: index + 1,
                    });
                    this.props.history.push({
                      pathname: `/collections/${urlPath}`,
                    });
                  }}
                >
                  <span className="text-size-big text-weight-bolder">{t('SeeAll')}</span>
                  <IconNext className="icon icon__primary" />
                </span>
              </div>
              {stores &&
                this.renderCarouselStores(stores, shippingType, {
                  name,
                  index,
                })}
            </section>
          );
        })}
      </div>
    );
  }
}

export default withTranslation(['SiteHome'])(withRouter(Carousel));
