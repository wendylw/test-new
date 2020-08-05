import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ProductItem from '../../../../components/ProductItem';
import { ScrollObserver, ScrollObservable } from '../../../../../components/ScrollComponents';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as homeActionsCreator, getShoppingCart, getCategoryProductList } from '../../../../redux/modules/home';
import Utils from '../../../../../utils/utils';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../../utils/gtm';
import Constants from '../../../../../utils/constants';
import { withRouter } from 'react-router-dom';
import config from '../../../../../config';
import qs from 'qs';
class CategoryProductList extends Component {
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
      await this.props.homeActions.loadShoppingCart();

      if (product.variations && product.variations.length) {
        this.handleGtmEventTracking(GTM_TRACKING_EVENTS.VIEW_PRODUCT, product);

        onToggle('PRODUCT_DETAIL');
      } else {
        this.handleGtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, product);
      }
    } catch (e) {
      console.error(e);
    }
  };

  handleGtmEventTracking = (eventName, data) => {
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

  handleShowProductDetail = async product => {
    const { onToggle } = this.props;

    const { responseGql = {} } = await this.props.homeActions.loadProductDetail(product);
    const { data: productDetail = {} } = responseGql;
    this.handleGtmEventTracking(GTM_TRACKING_EVENTS.VIEW_PRODUCT, productDetail.product);
    await this.props.homeActions.loadShoppingCart();

    onToggle('PRODUCT_DESCRIPTION');
  };

  render() {
    const { categories, isVerticalMenu } = this.props;
    return (
      <div id="product-list" className="list__container">
        <ScrollObserver
          render={scrollid => {
            const categoryList = categories || [];
            const currentTarget = categoryList.find(category => category.id === scrollid) || categoryList[0];
            let target = currentTarget;

            if (!currentTarget || !isVerticalMenu) {
              return null;
            }

            if (
              document
                .getElementById('root')
                .getAttribute('class')
                .includes('fixed')
            ) {
              target = this.prevCategory || {};
            } else {
              this.prevCategory = currentTarget;
            }

            return (
              <h2 className="category__header fixed flex flex-middle flex-space-between" data-testid="categoryRight">
                <label>{target.name || ''}</label>
                {/* {target.cartQuantity ? (
                  <span className="gray-font-opacity">
                    {t('CartItemsInCategory', { cartQuantity: target.cartQuantity })}
                  </span>
                ) : null} */}
              </h2>
            );
          }}
        />
        <ol className="category__list" data-heap-name="ordering.home.product-list">
          {categories.map(category => (
            <li key={category.id} id={category.id}>
              <ScrollObservable targetId={category.id} key={category.id}>
                <h2 className="category__header flex flex-middle flex-space-between">
                  <label>{category.name}</label>
                </h2>
                <ul className="list">
                  {(category.products || []).map(product => (
                    <ProductItem
                      key={product.id}
                      image={product.images[0]}
                      title={product.title}
                      price={product.displayPrice}
                      cartQuantity={product.cartQuantity}
                      soldOut={product.soldOut}
                      decreaseDisabled={false}
                      onDecrease={this.handleDecreaseProductInCart.bind(this, product)}
                      onIncrease={this.handleIncreaseProductInCart.bind(this, product)}
                      showProductDetail={this.handleShowProductDetail.bind(this, product)}
                      isFeaturedProduct={product.isFeaturedProduct}
                      isValidTimeToOrder={this.props.isValidTimeToOrder}
                      data-heap-name="ordering.home.product-item"
                    />
                  ))}
                </ul>
              </ScrollObservable>
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

CategoryProductList.propTypes = {
  onToggle: PropTypes.func,
  isVerticalMenu: PropTypes.bool,
  isValidTimeToOrder: PropTypes.bool,
};

CategoryProductList.defaultProps = {
  onToggle: () => {},
  isVerticalMenu: false,
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
)(withRouter(CategoryProductList));
