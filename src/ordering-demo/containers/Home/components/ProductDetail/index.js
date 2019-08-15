import React, { Component } from "react";
import PropTypes from 'prop-types';
import ProductItem from '../ProductItem';
import VariationSelector from '../VariationSelector';
import config from "../../../../../config";
import Utils from '../../../../libs/utils';
import Constants from '../../../../libs/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { getProductById } from "../../../../../redux/modules/entities/products";
import { actions as homeActions, getCurrentProduct } from "../../../../redux/modules/home";

class ProductDetail extends Component {
  state = {
    variationsByIdMap: {}, // Object<VariationId: Object<variationType, OptionId:option >>
    cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
  };

  displayPrice() {
    const { product } = this.props;
    const { childrenMap, unitPrice, onlineUnitPrice } = product;

    const variationNames = this.getVariationNames();

    const childProduct = childrenMap.find(
      ({ variation }) =>
        variation.sort().toString() === variationNames.sort().toString()
    );

    let displayPrice = childProduct ? childProduct.displayPrice : product.displayPrice;
    const diffPriceArr = this.getVariationPriceDiffs();

    if (diffPriceArr.length) {
      displayPrice = (displayPrice || onlineUnitPrice || unitPrice) + diffPriceArr.reduce((total, diff) => total + diff, 0);
    }

    return displayPrice;
  }

  componentDidMount() {
    this.setState({ active: true });
  }

  componentWillUnmount() {
    this.setState({ active: false });
  }

  isSubmitable() {
    const { cartQuantity, variationsByIdMap } = this.state;
    const singleChoiceVariations = this.getSingleChoiceVariations();

    // check: cart should not empty
    let submitable = cartQuantity > 0;

    // check: if product has single variants, then they should be all selected.
    if (singleChoiceVariations.length > 0) {
      submitable =
        submitable &&
        this.getVariationsValue().length > 0 &&
        singleChoiceVariations.filter(
          v => (variationsByIdMap[v.id] || []).length > 0
        ).length === singleChoiceVariations.length;
    }

    return submitable;
  }

  getVariationsByType = (type) => {
    const { product } = this.props;

    if (!product) {
      return [];
    }

    if (!type) {
      return product.variations;
    }

    return product.variations.filter((variation) => variation.variationType === type);
  }

  getSingleChoiceVariations() {
    return this.getVariationsByType('SingleChoice');
  }

  getMultipleChoiceVariations() {
    return this.getVariationsByType('MultipleChoice');
  }

  setVariationsByIdMap(variationId, variationAndOptionById) {
    const newState = {
      variationsByIdMap: this.state.variationsByIdMap
    };

    // don't know why, but just found that set values to this.state
    // can avoid another call issue in an extremely shot time.
    // which case is about auto select first SingleChoice variations.
    newState.variationsByIdMap[variationId] = variationAndOptionById;

    this.setState(newState);
  }

  getVariationsValue() {
    const { variationsByIdMap } = this.state;
    return Object.values(variationsByIdMap).reduce(
      (ret, arr) => [...ret, ...arr],
      []
    );
  }

  getVariationOptionValuesWithFieldOnly(field) {
    const { product } = this.props;
    const variations = this.getVariationsValue();
    return variations.map(({ variationId, optionId }) => {
      const variation = product.variations.find(v => v.id === variationId);
      const optionValue = variation.optionValues.find(o => o.id === optionId);
      return optionValue[field];
    });
  }

  getVariationNames() {
    return this.getVariationOptionValuesWithFieldOnly("value");
  }

  getVariationPriceDiffs() {
    return this.getVariationOptionValuesWithFieldOnly("priceDiff");
  }

  handleAddOrUpdateShoppingCartItem = async (variables) => {
    await homeActions.addOrUpdateShoppingCartItem(variables);
    await homeActions.loadShoppingCart();
    this.handleHideProductDetail();
  }

  renderProductItem() {
    const { product } = this.props;
    const { cartQuantity } = this.state;
    const { id: productId, images, title } = product || {};
    const imageUrl = Array.isArray(images) ? images[0] : null;

    if (!product) {
      return null;
    }

    return (
      <div className="aside__fix-bottom">
        <ProductItem
          className="aside__section-container border__top-divider"
          image={imageUrl}
          title={title}
          price={this.displayPrice()}
          quantity={cartQuantity}
          decreaseDisabled={cartQuantity === 1}
          onDecrease={() => this.setState({ cartQuantity: cartQuantity - 1 })}
          onIncrease={() => this.setState({ cartQuantity: cartQuantity + 1 })}
        />

        <div className="aside__section-container">
          <button
            className="button__fill button__block font-weight-bold"
            type="button"
            disabled={!this.isSubmitable() || Utils.isProductSoldOut(product)}
            onClick={async () => {
              const variations = this.getVariationsValue();

              if (this.isSubmitable()) {
                await this.props.addOrUpdateShoppingCartItem({
                  action: "add",
                  business: config.business,
                  productId,
                  quantity: cartQuantity,
                  variations
                });
              }
            }}
          >OK</button>
        </div>
      </div>
    );
  }

  render() {
    const className = ['aside', 'aside__product-detail flex flex-column flex-end'];
    const {
      product,
      viewProductDetail,
    } = this.props;

    if (viewProductDetail && product && product.id && !product._needMore) {
      className.push('active');
    }

    return (
      <aside className={className.join(" ")} onClick={this.handleClickOverlay}>
        <div className="product-detail">
          {this.getSingleChoiceVariations().length ? (
            <ol className="product-detail__options-category">
              {this.getSingleChoiceVariations().map(variation => (
                <VariationSelector
                  key={variation.id}
                  variation={variation}
                  onChange={this.setVariationsByIdMap.bind(this, variation.id)}
                />
              ))}
            </ol>
          ) : null}

          {this.getMultipleChoiceVariations().length ? (
            <ol className="product-detail__options-category">
              {this.getMultipleChoiceVariations().map(variation => (
                <VariationSelector
                  key={variation.id}
                  variation={variation}
                  onChange={this.setVariationsByIdMap.bind(this, variation.id)}
                />
              ))}
            </ol>
          ) : null}

          {this.renderProductItem()}
        </div>
      </aside>
    );
  }
}

ProductDetail.propTypes = {
  viewProductDetail: PropTypes.bool,
  onToggle: PropTypes.func,
};

ProductDetail.defaultProps = {
  viewProductDetail: false,
  onToggle: () => { }
};

export default connect(
  state => {
    const currentProductInfo = getCurrentProduct(state);

    return {
      product: currentProductInfo && getProductById(state, currentProductInfo.id),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(ProductDetail);
