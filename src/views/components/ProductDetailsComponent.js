import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ItemComponent from './ItemComponent';
import VariationSelectorComponent from './VariationSelectorComponent';

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
  }

  static defaultProps = {
    product: null,
    shoppingCart: null,
  }

  state = {
    mergedProduct: null,
    variationsByIdMap: {}, // Object<VariationId, Array<[VariationId, OptionId]>>
  };

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

  render() {
    const { product } = this.props;

    if (!product) {
      return null;
    }

    console.log('variations =>', JSON.stringify(
      Object.values(this.state.variationsByIdMap, null, 2)
    ));
    
    const { images, title, displayPrice, cartQuantity } = product;
    const imageUrl = Array.isArray(images) ? images[0] : null;

    return (
      <div>
        <h3>--SingleChoice--</h3>
        {
          this.getSingleChoiceVariations().map(variation => (
            <VariationSelectorComponent
              key={variation.id}
              variation={variation}
              onChange={this.setVariationsByIdMap.bind(this, variation.id)}
            />
          ))
        }

        <h3>--MultipleChoice--</h3>
        {
          this.getMultipleChoiceVariations().map(variation => (
            <VariationSelectorComponent
              key={variation.id}
              variation={variation}
              onChange={this.setVariationsByIdMap.bind(this, variation.id)}
            />
          ))
        }

        <h3>--Product View--</h3>
        <ItemComponent
          image={imageUrl}
          title={title}
          price={displayPrice}
          quantity={cartQuantity}
          onDecrease={() => {
            // TODO: add to cart
          }}
          onIncrease={() => {
            // TODO: add to cart
          }}
        />
      </div>
    )
  }
}

export default ProductDetailsComponent;
