import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ItemComponent from './ItemComponent';
import VariationSelectorComponent from './VariationSelectorComponent';
import config from '../../config';
import Constants from '../../Constants';
import Aside from './Aside';

export class ProductDetailsComponent extends Component {
  static propTypes = {
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
    addOrUpdateShoppingCartItem: PropTypes.func,
  }

  static defaultProps = {
    product: null,
    shoppingCart: null,
    addOrUpdateShoppingCartItem: () => {},
  }

  state = {
    active: false,
    mergedProduct: null,
    variationsByIdMap: {}, // Object<VariationId, Array<[VariationId, OptionId]>>
    cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
  };

  displayPrice() {
    const { product } = this.props;
    const { childrenMap, unitPrice, onlineUnitPrice } = product;

    const variationNames = this.getVariationNames();

    const childProduct = childrenMap.find(({ variation }) => (
      variation.sort().toString() === variationNames.sort().toString()
    ));

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

    return cartQuantity > 0
      && this.getVariationsValue().length > 0
      && singleChoiceVariations.filter(
        v => (variationsByIdMap[v.id] || []).length > 0
      ).length === singleChoiceVariations.length;
  }

  getSingleChoiceVariations() {
    const { variations } = this.props.product || {};
    return Array.isArray(variations)
      ? variations.filter(v => v.variationType === 'SingleChoice')
      : [];
  }

  getMultipleChoiceVariations() {
    const { variations } = this.props.product || {};
    return Array.isArray(variations)
      ? variations.filter(v => v.variationType === 'MultipleChoice')
      : [];
  }

  setVariationsByIdMap(variationId, variationAndOptionById) {
    const newState = {
      variationsByIdMap: this.state.variationsByIdMap,
    };

    // don't know why, but just found that set values to this.state
    // can avoid another call issue in an extremely shot time.
    // which case is about auto select first SingleChoice variations.
    newState.variationsByIdMap[variationId] = variationAndOptionById;

    this.setState(newState);
  }

  getVariationsValue() {
    const { variationsByIdMap } = this.state;
    return Object.values(variationsByIdMap).reduce((ret, arr) => [...ret, ...arr], []);
  }

  getVariationOptionValuesWithFieldOnly(field) {
    const { product } = this.props;
    const variations = this.getVariationsValue();
    return variations.map(({ variationId, optionId }) => {
      const variation = product.variations.find(v => v.id === variationId);
      const optionValue = variation.optionValues.find(o => o.id === optionId);
      return optionValue[field];
    })
  }

  getVariationNames() {
    return this.getVariationOptionValuesWithFieldOnly('value');
  }

  getVariationPriceDiffs() {
    return this.getVariationOptionValuesWithFieldOnly('priceDiff');
  }

  hide() {
    const { history } = this.props;
    history.replace(Constants.ROUTER_PATHS.HOME, history.location.state);;
  }

  render() {
    const { product } = this.props;
    const { cartQuantity, variationsByIdMap } = this.state;

    if (!product) {
      return null;
    }

    console.log('variationsByIdMap =>', variationsByIdMap);

    const { id: productId, images, title } = product;
    const imageUrl = Array.isArray(images) ? images[0] : null;

    return (
      <Aside active={this.state.active} className={`aside aside__product-detail`} onClick={(e) => {
        if (e.target === e.currentTarget) {
          this.hide();
        }
      }}>
        <>
          <div className="product-detail">
            {
              this.getSingleChoiceVariations().length ? (
                <ol className="product-detail__options-category">
                {
                  this.getSingleChoiceVariations().map(variation => (
                    <VariationSelectorComponent
                      key={variation.id}
                      variation={variation}
                      onChange={this.setVariationsByIdMap.bind(this, variation.id)}
                    />
                  ))
                }
                </ol>
              ) : null
            }

            {
              this.getMultipleChoiceVariations().length ? (
                <ol className="product-detail__options-category">
                {
                  this.getMultipleChoiceVariations().map(variation => (
                    <VariationSelectorComponent
                      key={variation.id}
                      variation={variation}
                      onChange={this.setVariationsByIdMap.bind(this, variation.id)}
                    />
                  ))
                }
                </ol>
              ) : null
            }
          </div>
          
          <div className="aside__fix-bottom">
            <ItemComponent
              className="aside__section-container border__top-divider"
              image={imageUrl}
              title={title}
              price={this.displayPrice()}
              quantity={cartQuantity}
              decreaseDisabled={cartQuantity === Constants.ADD_TO_CART_MIN_QUANTITY}
              onDecrease={() => {
                this.setState({ cartQuantity: cartQuantity - 1 });
              }}
              onIncrease={() => {
                this.setState({ cartQuantity: cartQuantity + 1 });
              }}
            />

            <div className="aside__section-container">
              <button className="button__fill button__block font-weight-bold" type="button" onClick={async () => {
                const variations = this.getVariationsValue();

                if (this.isSubmitable()) {
                  const result = await this.props.addOrUpdateShoppingCartItem({
                    variables: {
                      action: 'add',
                      business: config.business,
                      productId,
                      quantity: cartQuantity,
                      variations,
                    }
                  });
                  console.debug('result (addOrUpdateShoppingCartItem) => %o', result);
                }

                // close popup and go back home.
                this.hide();
              }}>OK</button>
            </div>
          </div>
        </>
      </Aside>
    )
  }
}

export default ProductDetailsComponent;
