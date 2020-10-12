import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import SwiperCore, { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { withRouter } from 'react-router-dom';
import Image from '../../../../components/Image';
import MvpStorePlaceholderImage from '../../../../images/mvp-store-placeholder.jpg';
import { IconLocalOffer, IconWallet } from '../../../../components/Icons';
import 'swiper/swiper.scss';
import './index.scss';
import { submitStoreMenu } from '../../utils';

SwiperCore.use([Autoplay]);

class Carousel extends Component {
  handleStoreClicked = async store => {
    const { currentPlaceInfo } = this.props;
    await submitStoreMenu({ deliveryAddress: currentPlaceInfo, store: store, source: document.location.href });
  };

  renderClosedStoreTag = enablePreOrder => {
    const { t } = this.props;
    return enablePreOrder ? (
      <div className="store-card-list__image-cover">
        <label className="store-card-list__tag tag tag__small tag__privacy text-uppercase text-weight-bolder">
          {t('PreOrder')}
        </label>
      </div>
    ) : (
      <div className="store-card-list__image-cover flex flex-middle flex-center text-center text-line-height-base text-weight-bolder">
        {t('ClosedForNow')}
      </div>
    );
  };

  render() {
    const { collections, t } = this.props;
    return (
      <div>
        {(collections || []).map(item => {
          const { name, stores, urlPath, beepCollectionId } = item;
          return (
            <section key={beepCollectionId}>
              <div className="flex flex-space-between padding-left-right-normal">
                <h3 className="text-size-big text-weight-bolder">{name}</h3>
                <span
                  className="carousel__see-all text-size-big text-weight-bold"
                  data-heap-name="site.home.carousel.see-all-btn"
                  onClick={() => {
                    this.props.history.push({
                      pathname: `/collections/${urlPath}`,
                    });
                  }}
                >
                  {t('SeeAll')} &gt;
                </span>
              </div>
              <Swiper className="margin-top-bottom-normal" slidesPerView={'auto'}>
                {(stores || []).map(store => {
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
                  } = store || {};

                  const cashbackRatePercentage = (Number(cashbackRate) || 0) * 100;

                  return (
                    <SwiperSlide
                      key={id}
                      className="carousel__item border-radius-large"
                      data-heap-name="site.home.carousel.store-item"
                      data-heap-store-name={name}
                      onClick={() => {
                        this.handleStoreClicked(store);
                      }}
                    >
                      <div className="carousel__image-container">
                        {isOpen ? null : this.renderClosedStoreTag(enablePreOrder)}
                        <Image
                          className="carousel-store__image card__image"
                          src={avatar}
                          scalingRatioIndex={1}
                          placeholderImage={MvpStorePlaceholderImage}
                          alt={name}
                        />
                      </div>
                      <summary
                        className={`carousel-list__summary padding-left-right-small ${
                          isOpen || enablePreOrder ? '' : 'text-opacity'
                        }`}
                      >
                        <h3 className="carousel-list__title text-size-bigger text-weight-bolder text-omit__single-line">
                          {name}
                        </h3>
                        {enableCashback && cashbackRate ? (
                          <div className="flex flex-middle">
                            <IconWallet className="icon icon__privacy icon__smaller text-middle" />
                            <span className="text-size-smaller text-middle text-capitalize">
                              {t('EnabledCashbackText', {
                                cashbackRate: Math.round(cashbackRatePercentage * 100) / 100,
                              })}
                            </span>
                          </div>
                        ) : null}
                        {enableFreeShipping && deliveryFee ? (
                          <div className="flex flex-middle">
                            <IconLocalOffer className="icon icon__privacy icon__smaller text-middle" />
                            <span className="text-size-small text-middle">{t('MvpFreeDeliveryPrompt')}</span>
                          </div>
                        ) : null}
                      </summary>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </section>
          );
        })}
      </div>
    );
  }
}

export default withTranslation(['SiteHome'])(withRouter(Carousel));
