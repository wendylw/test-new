import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import LazyLoad from 'react-lazyload';
import { ScrollObservable } from '../../../../components/ScrollComponents';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import {
  actions as homeActionsCreator,
  getShoppingCart,
  getCategoryProductList,
  getProductItemMinHeight,
} from '../../../redux/modules/home';
import Utils from '../../../../utils/utils';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../utils/gtm';
import Constants from '../../../../tils/constants';
import config from '../../../../config';

class ProductList extends Component {
  handleGtmEventTracking = (eventName, data) => {
    if (!data) return;
    let gtmTrackingData = {};
    if (eventName === GTM_TRACKING_EVENTS.VIEW_PRODUCT) {
      gtmTrackingData = {
        product_name: data.title,
        product_id: data.id,
        price_local: data.displayPrice,
        product_type: data.inventoryType,
        Inventory: !!data.markedSoldOut ? 'In stock' : 'Out of stock',
        image_count: (data.images && data.images.length) || 0,
        product_description: data.description,
      };
    }

    if (eventName === GTM_TRACKING_EVENTS.ADD_TO_CART) {
      gtmTrackingData = {
        product_name: data.title,
        product_id: data.id,
        price_local: data.displayPrice,
        variant: data.variations,
        quantity: data.quantityOnHand,
        product_type: data.inventoryType,
        Inventory: !!data.soldOut ? 'In stock' : 'Out of stock',
        image_count: (data.images && data.images.length) || 0,
      };
    }

    return gtmEventTracking(eventName, gtmTrackingData);
  };

  gotoLocationAndDatePage() {
    const { search } = window.location;
    const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_HOME}${search}`);

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
      search: `${search}&callbackUrl=${callbackUrl}`,
    });
  }

  isNeedToLocationAndDatePage() {
    const deliveryAddress = Utils.getSessionVariable('deliveryAddress');
    const isDeliveryType = Utils.isDeliveryType();
    const isPickupType = Utils.isPickUpType();
    const storeId = config.storeId;
    const expectedDeliveryDate = Utils.getSessionVariable('expectedDeliveryDate');
    const expectedDeliveryHour = Utils.getSessionVariable('expectedDeliveryHour');

    // dine order no need goto location and date page
    if (!isDeliveryType && !isPickupType) {
      return false;
    }

    if (!storeId) {
      return true;
    }

    if (isDeliveryType && !deliveryAddress) {
      return true;
    }

    if (!expectedDeliveryDate || !expectedDeliveryHour) {
      return true;
    }

    return false;
  }

  handleShowProductDetail = async (product, categoryInfo) => {
    if (this.isNeedToLocationAndDatePage()) {
      this.gotoLocationAndDatePage();
      return;
    }

    const { onToggle, onProductClick, onProductView } = this.props;

    if (onProductClick) {
      onProductClick({ product, categoryInfo });
    }

    const { responseGql = {} } = await this.props.homeActions.loadProductDetail(product);
    const { data: productDetail = {} } = responseGql;

    onToggle('PRODUCT_DETAIL');

    if (onProductView) {
      onProductView({ product, categoryInfo });
    }

    this.handleGtmEventTracking(GTM_TRACKING_EVENTS.VIEW_PRODUCT, productDetail.product);
    await this.props.homeActions.loadShoppingCart();
  };

  renderProductItemPrice(price, originalDisplayPrice) {
    return (
      <div>
        {originalDisplayPrice ? (
          <CurrencyNumber
            className="product-item__price text-size-small text-line-through"
            money={originalDisplayPrice}
            numberOnly={true}
          />
        ) : null}
        <CurrencyNumber
          className={`product-item__price ${originalDisplayPrice ? 'text-error' : ''}`}
          money={price || 0}
          numberOnly={true}
        />
      </div>
    );
  }

  renderProductItemRightController(stockStatus, cartQuantity) {
    const { t } = this.props;

    if (['outOfStock', 'markSoldOut', 'unavailable'].includes(stockStatus)) {
      return <Tag text={t('SoldOut')} className="product-item__tag tag tag__default text-size-big" />;
    }

    return (
      <>
        {cartQuantity > 0 ? (
          <span className="product-item__selected  text-size-small">{t('Selected', { quantity: cartQuantity })}</span>
        ) : null}
      </>
    );
  }

  renderProductItemContentTag(isFeaturedProduct) {
    const { t } = this.props;

    if (!isFeaturedProduct) {
      return null;
    }

    return <Tag text={t('BestSeller')} className="tag__small tag__primary text-size-smaller" />;
  }

  render() {
    const { categories, style, productItemMinHeight } = this.props;

    return (
      <div id="product-list" className="category" ref={ref => (this.productList = ref)} style={style}>
        <ol className="category__list" data-heap-name="ordering.home.product-list">
          {categories.map((category, categoryIndex) => (
            <li key={category.id} id={category.id}>
              <ScrollObservable targetId={category.id} key={category.id}>
                <h2 className="category__header padding-top-bottom-small padding-left-right-smaller sticky-wrapper">
                  <label className="padding-left-right-small text-size-small">{category.name}</label>
                </h2>
                <div>
                  {(category.products || []).map(product => {
                    const {
                      variation,
                      title,
                      images,
                      isFeaturedProduct,
                      price,
                      originalDisplayPrice,
                      stockStatus,
                      cartQuantity,
                    } = product;

                    return (
                      <LazyLoad offset={0} height={productItemMinHeight} scrollContainer="#product-list">
                        <Item
                          data-heap-name="ordering.home.product-item"
                          image={images[0]}
                          imageCover={}
                          summaryTag={this.renderProductItemContentTag(isFeaturedProduct)}
                          title={title}
                          variation={variation}
                          details={this.renderProductItemPrice(price, originalDisplayPrice)}
                          handleClickItem={() =>
                            this.handleShowProductDetail(product, {
                              name: category.name,
                              index: categoryIndex,
                            })
                          }
                        >
                          {this.renderProductItemRightController(stockStatus, cartQuantity)}
                        </Item>
                      </LazyLoad>
                    );
                  })}
                </div>
              </ScrollObservable>
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

ProductList.propTypes = {
  onToggle: PropTypes.func,
  isValidTimeToOrder: PropTypes.bool,
  style: PropTypes.object,
};

ProductList.defaultProps = {
  onToggle: () => {},
  isValidTimeToOrder: true,
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        shoppingCart: getShoppingCart(state),
        categories: getCategoryProductList(state),
        productItemMinHeight: getProductItemMinHeight(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionsCreator, dispatch),
    })
  )
)(withRouter(ProductList));
