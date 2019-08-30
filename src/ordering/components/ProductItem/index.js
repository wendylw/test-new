import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Item from '../Item';
import Tag from '../../../components/Tag';
import ItemOperator from '../ItemOperator';
import CurrencyNumber from '../../components/CurrencyNumber';

export class ProductItem extends Component {
  render() {
    const {
      className,
      variation,
      image,
      title,
      price,
      soldOut,
      cartQuantity,
      decreaseDisabled,
      onDecrease,
      onIncrease,
    } = this.props;

    return (
      <Item
        className={className}
        contentClassName="flex-middle"
        image={image}
        title={title}
        variation={variation}
        detail={
          <CurrencyNumber money={price || 0} />
        }
      >
        {
          soldOut
            ? <Tag text="Sold Out" className="tag__card" />
            : (
              <ItemOperator
                className="flex-middle"
                quantity={cartQuantity}
                decreaseDisabled={decreaseDisabled}
                onDecrease={onDecrease}
                onIncrease={onIncrease}
              />
            )
        }
      </Item>
    )
  }
}

ProductItem.propTypes = {
  className: PropTypes.string,
  variation: PropTypes.string,
  soldOut: PropTypes.bool,
  image: PropTypes.string,
  title: PropTypes.string,
  price: PropTypes.number,
  cartQuantity: PropTypes.number,
  decreaseDisabled: PropTypes.bool,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
};

ProductItem.defaultProps = {
  className: '',
  variation: '',
  soldOut: false,
  image: '',
  title: '',
  price: 0,
  cartQuantity: 0,
  decreaseDisabled: false,
  onDecrease: () => { },
  onIncrease: () => { },
};

export default ProductItem;
