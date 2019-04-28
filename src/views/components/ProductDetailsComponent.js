import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ItemComponent from './ItemComponent';
import VariationSelectorComponent from './VariationSelectorComponent';
import config from '../../config';
import Constants from '../../Constants';

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
    mergedProduct: null,
    variationsByIdMap: {}, // Object<VariationId, Array<[VariationId, OptionId]>>
    cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
  };

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
    this.setState({
      variationsByIdMap: {
        ...this.state.variationsByIdMap,
        [variationId]: variationAndOptionById,
      },
    })
  }

  getVariationsValue() {
    const { variationsByIdMap } = this.state;
    return Object.values(variationsByIdMap).reduce((ret, arr) => [...ret, ...arr], []);
  }

  render() {
    const { product, history } = this.props;
    const { cartQuantity, variationsByIdMap } = this.state;

    if (!product) {
      return null;
    }

    console.log('variationsByIdMap =>', variationsByIdMap);
    
    const { id: productId, images, title, displayPrice } = product;
    const imageUrl = Array.isArray(images) ? images[0] : null;

    return (
      <div className="product-detail">
        {
          this.getSingleChoiceVariations().length ? (
            <ol className="product-detail__options-category border-botton__divider">
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
            <ol className="product-detail__options-category border-botton__divider">
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

        <ItemComponent
          image={imageUrl}
          title={title}
          price={displayPrice}
          quantity={cartQuantity}
          decreaseDisabled={cartQuantity === Constants.ADD_TO_CART_MIN_QUANTITY}
          onDecrease={() => {
            this.setState({ cartQuantity: cartQuantity - 1 });
          }}
          onIncrease={() => {
            this.setState({ cartQuantity: cartQuantity + 1 });
          }}
        />
        
        <div className="aside__fix-bottom aside__section-container">
          <button className="button__fill button__block font-weight-bold" type="button" onClick={async () => {
            const variations = this.getVariationsValue();

            if (this.isSubmitable()) {
              const result = await this.props.addOrUpdateShoppingCartItem({
                variables: {
                  action: 'edit',
                  business: config.business,
                  productId,
                  quantity: cartQuantity,
                  variations,
                }
              });
              console.debug('result (addOrUpdateShoppingCartItem) => %o', result);
            }

            // close popup and go back home.
            history.replace(Constants.ROUTER_PATHS.HOME, history.location.state);
          }}>OK</button>
        </div>
        
      </div>
    )
  }
}

export default ProductDetailsComponent;
