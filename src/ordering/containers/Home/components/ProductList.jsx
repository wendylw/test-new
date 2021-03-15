import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ProductItem from '../../../components/ProductItem';
import { ScrollObservable } from '../../../../components/ScrollComponents';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as homeActionsCreator, getShoppingCart, getCategoryProductList } from '../../../redux/modules/home';
import Utils from '../../../../utils/utils';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../utils/gtm';
import Constants from '../../../../tils/constants';
import { withRouter } from 'react-router-dom';
import config from '../../../../config';
import qs from 'qs';

class ProductList extends Component {
  prevCategory = null;

  handleDecreaseProductInCart = async product => {
    try {
      const { shoppingCart, onShowCart } = this.props;
      if (!product.canDecreaseQuantity) {
        // set currentProduct
        await this.props.homeActions.loadProductDetail(product);
        onShowCart();
      } else {
        await this.props.homeActions.decreaseProductInCart(shoppingCart, product);
        await this.props.homeActions.loadShoppingCart();
      }
    } catch (e) {
      console.error(e);
    }
  };

  handleIncreaseProductInCart = async product => {
    let deliveryAddress = Utils.getSessionVariable('deliveryAddress');
    const search = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });

    if ((!deliveryAddress && Utils.isDeliveryType()) || !config.storeId || !search.h) {
      const { search } = window.location;
      const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_HOME}${search}`);

      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
        search: `${search}&callbackUrl=${callbackUrl}`,
      });
      return;
    }

    const { onToggle } = this.props;

    try {
      await this.props.homeActions.increaseProductInCart(product);

      if (product.variations && product.variations.length) {
        onToggle('PRODUCT_DETAIL');

        this.handleGtmEventTracking(GTM_TRACKING_EVENTS.VIEW_PRODUCT, product);
      } else {
        this.handleGtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, product);
      }

      await this.props.homeActions.loadShoppingCart();
    } catch (e) {
      console.error(e);
    }
  };

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

  render() {
    const { categories, style } = this.props;

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
                  {(category.products || []).map(product => (
                    <ProductItem
                      scrollContainer="#product-list"
                      key={product.id}
                      image={product.images[0]}
                      title={product.title}
                      price={product.displayPrice}
                      originalDisplayPrice={product.originalDisplayPrice}
                      cartQuantity={product.cartQuantity}
                      soldOut={product.soldOut}
                      decreaseDisabled={false}
                      onDecrease={this.handleDecreaseProductInCart.bind(this, product)}
                      onIncrease={this.handleIncreaseProductInCart.bind(this, product)}
                      showProductDetail={this.handleShowProductDetail.bind(this, product, {
                        name: category.name,
                        index: categoryIndex,
                      })}
                      isFeaturedProduct={product.isFeaturedProduct}
                      isValidTimeToOrder={this.props.isValidTimeToOrder}
                      showOperator={false}
                      data-heap-name="ordering.home.product-item"
                    />
                  ))}
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
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionsCreator, dispatch),
    })
  )
)(withRouter(ProductList));
