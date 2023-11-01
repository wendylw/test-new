import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import Banner from './components/Banner';
import StoreCard from './components/StoreCard';
import Slider from '../../../../common/components/Slider';
import './index.scss';
import { submitStoreMenu } from '../../utils';
import CleverTap from '../../../../utils/clevertap';
import { getAddressInfo } from '../../../../redux/modules/address/selectors';

class Carousel extends Component {
  handleStoreClicked = async (index, store, collectionInfo) => {
    const shippingType = _get(store, 'shippingType', '');
    const promoTag = _get(store, 'promoTag', '');
    const cashback = _get(store, 'cashbackRate', 0);

    CleverTap.pushEvent('Homepage - Click Carousel Store Card', {
      'collection name': collectionInfo.name,
      'collection rank': collectionInfo.index,
      'store name': _get(store, 'name', ''),
      'store rank': index + 1,
      'shipping type': shippingType,
      'has promo': !_isEmpty(promoTag),
      cashback,
      'has lowest price': _get(store, 'isLowestPrice', false),
    });

    const { addressInfo } = this.props;

    await submitStoreMenu({
      deliveryAddress: addressInfo,
      store,
      source: document.location.href,
      shippingType: shippingType.toLowerCase(),
    });
  };

  handleTitleBarClicked = (index, item) => {
    const { history } = this.props;
    const { name, urlPath, beepCollectionId } = item;

    CleverTap.pushEvent('Homepage - Click Carousel See All', {
      'collection name': name,
      'collection id': beepCollectionId,
      rank: index + 1,
    });

    history.push({
      pathname: `/collections/${urlPath}`,
    });
  };

  renderCarouselStores(stores, collectionInfo) {
    return (
      <Slider
        perView="auto"
        slideContainerClassName="sm:tw-px-16px tw-px-16 sm:tw--mx-6px tw--mx-6"
        slideStyle={{ flex: '0 0 auto', width: 'auto' }}
      >
        {(stores || []).map((store, index) => {
          const { id } = store || {};
          return (
            <div key={id} className="carousel__item tw-flex tw-justify-center">
              <StoreCard
                store={store}
                onClick={() => this.handleStoreClicked(index, store, collectionInfo)}
                data-test-id="site.home.carousel.store-card"
              />
            </div>
          );
        })}
      </Slider>
    );
  }

  render() {
    const { collections } = this.props;
    return (
      <div className="sm:tw-mt-16px tw-mt-16">
        {(collections || []).map((item, index) => {
          const { name, stores, beepCollectionId } = item;
          return (
            <section key={beepCollectionId} data-test-id="site.home.carousel.container">
              <Banner
                title={name}
                onClick={() => this.handleTitleBarClicked(index, item)}
                data-test-id="site.home.carousel.banner"
              />
              {stores &&
                this.renderCarouselStores(stores, {
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

Carousel.displayName = 'Carousel';

Carousel.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  addressInfo: PropTypes.object,
  collections: PropTypes.array,
  /* eslint-enable */
};

Carousel.defaultProps = {
  addressInfo: null,
  collections: [],
};

export default compose(connect(state => ({ addressInfo: getAddressInfo(state) })))(withRouter(Carousel));
