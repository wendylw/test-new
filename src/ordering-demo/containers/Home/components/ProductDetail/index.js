import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import VariationSelector from '../VariationSelector';
import ProductItem from '../../../../components/ProductItem';
import config from '../../../../../config';
import Utils from '../../../../libs/utils';
import Constants from '../../../../libs/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getProductById } from '../../../../../redux/modules/entities/products';
import { actions as homeActions, getCurrentProduct } from '../../../../redux/modules/home';

const VARIATION_TYPES = {
  SINGLE_CHOICE: 'SingleChoice',
  MULTIPLE_CHOICE: 'MultipleChoice',
};
const EXECLUDE_KEYS = ['variationType'];

class ProductDetail extends Component {
  currentProductId = null;
  productEl = null;
  asideEl = null;

  state = {
    variationsByIdMap: {}, // Object<VariationId: Object<variationType, OptionId:option >>
    cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
  };

  componentDidMount() {
    const { product } = this.props;

    this.initVariationsByIdMap(product);
  }

  componentWillReceiveProps(nextProps) {
    const { product } = nextProps;
    const {
      variations,
      id,
    } = product || {};

    if (!id || !variations) {
      return;
    }

    if ((!this.props.product && id) || (id !== this.props.product.id)) {
      this.initVariationsByIdMap(product);
    }
  }

  initVariationsByIdMap(product) {
    let newMap = {};

    if (!product || !product.variations) {
      return;
    }

    product.variations.forEach(variation => {
      if (variation.optionValues.length && variation.variationType === VARIATION_TYPES.SINGLE_CHOICE) {
        const defaultOption = variation.optionValues.find(o => !o.markedSoldOut);

        if (defaultOption) {
          newMap = Object.assign({}, newMap, this.getNewVariationsByIdMap(variation, defaultOption));
        }
      }
    });

    this.currentProductId = product.id

    this.setState({
      variationsByIdMap: newMap,
      cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
    });
  }

  getVariationsMaxHeight() {
    if (!this.asideEl || !this.productEl) {
      return null;
    }

    const asideHeight = ReactDOM.findDOMNode(this.asideEl).clientHeight;
    const productHeight = ReactDOM.findDOMNode(this.productEl).clientHeight;

    return `${(asideHeight * 0.9 - productHeight).toFixed(4)}px`;
  }

  displayPrice() {
    const { product } = this.props;
    const {
      childrenMap,
      unitPrice = 0,
      onlineUnitPrice = 0,
      displayPrice = 0
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

    const price = displayPrice || unitPrice || onlineUnitPrice;

    return (price + totalPriceDiff).toFixed(2);
  }

  getVariationText() {
    const { variationsByIdMap } = this.state;

    if (!variationsByIdMap && !Object.values(variationsByIdMap).length) {
      return '';
    }

    let variationText = [];

    Object.values(variationsByIdMap).forEach(function (variation) {
      Object.values(variation).forEach(option => {
        if (option.value) {
          variationText.push(option.value);
        }
      });
    });

    return variationText.join(',');
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

    if (newMap[variation.id] && !newMap[variation.id][option.id]) {
      newMap[variation.id][option.id] = {
        priceDiff: option.priceDiff,
        value: option.value,
      };
    }

    return newMap;
  }

  setVariationsByIdMap(variation, option) {
    const { variationsByIdMap } = this.state;
    const newVariation = this.getNewVariationsByIdMap(variation, option);
    let newMap = variationsByIdMap;

    if (!newMap[variation.id] || newMap[variation.id].variationType === VARIATION_TYPES.SINGLE_CHOICE) {
      newMap = Object.assign({}, newMap, newVariation);
    } else {
      if (newMap[variation.id][option.id]) {
        delete newMap[variation.id][option.id];
      } else {
        newMap[variation.id][option.id] = newVariation[variation.id][option.id];
      }
    }

    this.setState({ variationsByIdMap: newMap });
  }

  getChoiceVariations(type) {
    const { variations } = this.props.product || {};

    return Array.isArray(variations)
      ? variations.filter(v => v.variationType === type)
      : [];
  }

  handleHideProductDetail(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    onToggle();
  }

  handleAddOrUpdateShoppingCartItem = async (variables) => {
    const { homeActions } = this.props;

    await homeActions.addOrUpdateShoppingCartItem(variables);
    await homeActions.loadShoppingCart();
    this.handleHideProductDetail();
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
            <VariationSelector
              key={variation.id}
              variation={variation}
              onChange={this.setVariationsByIdMap.bind(this)}
            />
          ))
        }
        {
          multipleChoiceVariations.map(variation => (
            <VariationSelector
              key={variation.id}
              variation={variation}
              onChange={this.setVariationsByIdMap.bind(this)}
            />
          ))
        }
      </ol>
    );
  }

  renderProductOperator() {
    const {
      onlineStoreInfo,
      product,
    } = this.props;
    const { cartQuantity } = this.state;
    const {
      locale,
      currency,
    } = onlineStoreInfo || {};
    const { id: productId, images, title } = product || {};
    const imageUrl = Array.isArray(images) ? images[0] : null;

    if (!product) {
      return null;
    }

    return (
      <div
        ref={ref => this.productEl = ref}
        className="aside__fix-bottom"
      >
        <ProductItem
          className="aside__section-container border__top-divider"
          image={imageUrl}
          title={title}
          variation={this.getVariationText()}
          price={Number(this.displayPrice())}
          cartQuantity={cartQuantity}
          locale={locale}
          currency={currency}
          onDecrease={() => this.setState({ cartQuantity: cartQuantity - 1 })}
          onIncrease={() => this.setState({ cartQuantity: cartQuantity + 1 })}
        />

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
                this.handleAddOrUpdateShoppingCartItem({
                  action: 'add',
                  business: config.business,
                  productId: this.currentProductId || productId,
                  quantity: cartQuantity,
                  variations,
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
      <aside
        ref={ref => this.asideEl = ref}
        className={className.join(" ")}
        onClick={(e) => this.handleHideProductDetail(e)}
      >
        <div className="product-detail">
          <div
            className="product-detail__options-container"
            style={{ maxHeight: this.getVariationsMaxHeight() || '30vh' }}
          >
            {this.renderVriations()}
          </div>

          {this.renderProductOperator()}
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
      product: getProductById(state, currentProductInfo.id),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(ProductDetail);
