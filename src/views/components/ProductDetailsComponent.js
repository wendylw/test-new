import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { shoppingCartType } from '../propTypes';

import Item from '../../components/Item';
import CurrencyNumber from '../../components/CurrencyNumber';
import ItemOperator from '../../components/ItemOperator';
import VariationSelectorComponent from './VariationSelectorComponent';
import config from '../../config';
import Constants from '../../Constants';
import Aside from './Aside';
import Utils from '../../libs/utils';

const { PRODUCT } = Constants.HOME_ASIDE_NAMES;
const VARIATION_TYPES = {
  SINGLE_CHOICE: 'SingleChoice',
  MULTIPLE_CHOICE: 'MultipleChoice',
};
const EXECLUDE_KEYS = ['variationType'];

export class ProductDetailsComponent extends Component {
  currentProductId = null;
  productEl = null;
  asideEl = null;

  state = {
    variationsByIdMap: {}, // Object<VariationId: Object<variationType, OptionId:option >>
    cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
  };

  componentWillReceiveProps(nextProps) {
    const { product } = nextProps;
    let newMap = {};

    if (!product || !product.variations) {
      return;
    }

    if ((!this.product && product) || (product.id !== this.product.id)) {

      product.variations.forEach(variation => {
        if (variation.optionValues.length && variation.variationType === VARIATION_TYPES.SINGLE_CHOICE) {
          newMap = Object.assign({}, newMap, this.getNewVariationsByIdMap(variation, variation.optionValues[0]));
        }
      });

      this.currentProductId = product.id

      this.setState({
        variationsByIdMap: newMap,
        cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
      });
    }
  }

  getVariationsMaxHeight() {
    if (!this.asideEl || !this.productEl) {
      return null;
    }

    const asideHeight = ReactDOM.findDOMNode(this.asideEl).clientHeight;
    const productHeight = ReactDOM.findDOMNode(this.productEl).clientHeight;

    return `${(asideHeight * 0.9 - productHeight).toFixed(4)}px`;
  }

  shouldComponentUpdate(nextProps) {
    const { currentAside } = nextProps;

    return currentAside === PRODUCT;
  }

  displayPrice() {
    const { product } = this.props;
    const {
      childrenMap,
      unitPrice,
      onlineUnitPrice,
      displayPrice
    } = product || {};
    const { variationsByIdMap } = this.state;
    const selectedValues = [];
    let totalPriceDiff = 0;

    Object.values(variationsByIdMap).forEach(function (options) {
      Object.values(options).forEach(item => {
        if (item.value) {
          totalPriceDiff += item.priceDiff;

          selectedValues.push(item.value);
        }
      });
    });

    const childProduct = (childrenMap || []).find(({ variation }) => (
      variation.sort().toString() === selectedValues.sort().toString()
    ));

    if (childProduct) {
      this.currentProductId = childProduct.childId;

      return childProduct.displayPrice;
    }

    let price = displayPrice || unitPrice || onlineUnitPrice;

    return price + totalPriceDiff;
  }

  isSubmitable() {
    const {
      cartQuantity,
      variationsByIdMap,
    } = this.state;
    const singleChoiceVariations = this.getChoiceVariations(VARIATION_TYPES.SINGLE_CHOICE);

    // check: cart should not empty
    let submitable = cartQuantity > 0;

    // check: if product has single variants, then they should be all selected.
    if (singleChoiceVariations.length > 0) {
      const selectedAllSingleChoice = !singleChoiceVariations.find(variation => !Object.keys(variationsByIdMap).includes(variation.id));

      submitable = submitable && Object.values(variationsByIdMap).length > 0 && selectedAllSingleChoice;
    }

    return submitable;
  }

  getNewVariationsByIdMap(variation, option) {
    const newMap = {};

    if (!newMap[variation.id] || variation.variationType === VARIATION_TYPES.SINGLE_CHOICE) {
      newMap[variation.id] = {
        variationType: variation.variationType
      }
    }

    if (!newMap[variation.id][option.id]) {
      newMap[variation.id][option.id] = {
        priceDiff: option.priceDiff,
        value: option.value,
      };
    }

    return newMap;
  }

  setVariationsByIdMap(variation, option) {
    const { variationsByIdMap } = this.state;
    const newMap = Object.assign({}, variationsByIdMap, this.getNewVariationsByIdMap(variation, option));

    this.setState({ variationsByIdMap: newMap });
  }

  getChoiceVariations(type) {
    const { variations } = this.props.product || {};

    return Array.isArray(variations)
      ? variations.filter(v => v.variationType === type)
      : [];
  }

  renderVriations() {
    const { variations } = this.props.product || {};

    if (!variations || !variations.length) {
      return null;
    }

    const singleChoiceVariations = this.getChoiceVariations(VARIATION_TYPES.SINGLE_CHOICE);
    const multipleChoiceVariations = this.getChoiceVariations(VARIATION_TYPES.MULTIPLE_CHOICE);

    return (
      <ol className="product-detail__options-category">
        {
          singleChoiceVariations.map(variation => (
            <VariationSelectorComponent
              key={variation.id}
              variation={variation}
              onChange={this.setVariationsByIdMap.bind(this)}
            />
          ))
        }
        {
          multipleChoiceVariations.map(variation => (
            <VariationSelectorComponent
              key={variation.id}
              variation={variation}
              onChange={this.setVariationsByIdMap.bind(this)}
            />
          ))
        }
      </ol>
    );
  }

  render() {
    const {
      active,
      product,
      toggleAside,
      onlineStoreInfo,
    } = this.props;
    const {
      locale,
      currency,
    } = onlineStoreInfo || {};
    const { cartQuantity } = this.state;
    const { id: productId, images, title } = product || {};
    const imageUrl = Array.isArray(images) ? images[0] : null;

    return (
      <Aside
        ref={ref => this.asideEl = ref}
        active={active}
        className="aside__product-detail flex flex-column flex-end"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            toggleAside({ asideName: PRODUCT });
          }
        }}
      >
        <div className="product-detail">
          <div
            className="product-detail__options-container"
            style={{ maxHeight: this.getVariationsMaxHeight() || '30vh' }}
          >
            {this.renderVriations()}
          </div>

          <div
            ref={ref => this.productEl = ref}
            className="aside__fix-bottom"
          >
            <Item
              className="aside__section-container border__top-divider"
              contentClassName="flex-middle"
              image={imageUrl}
              title={title}
              detail={
                <CurrencyNumber
                  money={this.displayPrice() || 0}
                  locale={locale}
                  currency={currency}
                />
              }
            >

              <ItemOperator
                className="flex-middle"
                quantity={cartQuantity}
                decreaseDisabled={cartQuantity === Constants.ADD_TO_CART_MIN_QUANTITY}
                onDecrease={() => {
                  this.setState({ cartQuantity: cartQuantity - 1 });
                }}
                onIncrease={() => {
                  this.setState({ cartQuantity: cartQuantity + 1 });
                }}
              />
            </Item>
            <div className="aside__section-container">
              <button
                className="button__fill button__block font-weight-bold"
                type="button"
                disabled={!this.isSubmitable() || Utils.isProductSoldOut(product || {})}
                onClick={async () => {
                  const { variationsByIdMap } = this.state;
                  let variations = [];

                  Object.keys(variationsByIdMap).forEach(function (variationId) {
                    Object.keys(variationsByIdMap[variationId]).forEach(key => {
                      if (!EXECLUDE_KEYS.includes(key)) {
                        variations.push({
                          variationId,
                          optionId: key,
                        });
                      }
                    });
                  });

                  if (this.isSubmitable()) {
                    await this.props.addOrUpdateShoppingCartItem({
                      variables: {
                        action: 'add',
                        business: config.business,
                        productId: this.currentProductId || productId,
                        quantity: cartQuantity,
                        variations,
                      }
                    });
                  }

                  toggleAside({ asideName: PRODUCT });
                }}
              >OK</button>
            </div>
          </div>
        </div>
      </Aside >
    )
  }
}

ProductDetailsComponent.propTypes = {
  active: PropTypes.bool,
  currentAside: PropTypes.string,
  product: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    displayPrice: PropTypes.number,
    variations: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      variationType: PropTypes.string,
      optionValues: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        value: PropTypes.string,
      })),
    })),
  }),
  shoppingCart: shoppingCartType,
  toggleAside: PropTypes.func,
  addOrUpdateShoppingCartItem: PropTypes.func,
}

ProductDetailsComponent.defaultProps = {
  active: false,
  product: null,
  shoppingCart: null,
  toggleAside: () => { },
  addOrUpdateShoppingCartItem: () => { },
}

export default ProductDetailsComponent;
