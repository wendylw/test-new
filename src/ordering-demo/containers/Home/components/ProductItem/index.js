import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Tag from '../../../../components/Tag';
import Item from '../../../../components/Item';
import ItemOperator from '../../../../components/ItemOperator';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import Constants from '../../../../libs/constants';

export class ProductItem extends Component {
  render() {
    const {
      className,
      locale,
      currency,
      image,
      title,
      price,
      soldOut,
      cartQuantity,
      onDecrease,
      onIncrease,
    } = this.props;

    return (
      <Item
        className={className}
        contentClassName="flex-middle"
        image={image}
        title={title}
        detail={
          <CurrencyNumber
            money={price || 0}
            locale={locale}
            currency={currency}
          />
        }
      >
        {
          soldOut
            ? <Tag text="Sold Out" className="tag__card" />
            : (
              <ItemOperator
                className="flex-middle"
                quantity={cartQuantity}
                decreaseDisabled={cartQuantity === Constants.ADD_TO_CART_MIN_QUANTITY}
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
  locale: PropTypes.string,
  currency: PropTypes.string,
  className: PropTypes.string,
  soldOut: PropTypes.bool,
  image: PropTypes.string,
  title: PropTypes.string,
  price: PropTypes.number,
  cartQuantity: PropTypes.number,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
};

ProductItem.defaultProps = {
  className: '',
  soldOut: false,
  image: '',
  title: '',
  price: 0,
  cartQuantity: 0,
  onDecrease: () => { },
  onIncrease: () => { },
};

export default ProductItem;
