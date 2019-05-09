import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CurrencyNumber from './CurrencyNumber';
import Image from './Image';

export class ItemComponent extends Component {
  static propTypes = {
    image: PropTypes.string,
    title: PropTypes.string,
    variation: PropTypes.string,
    price: PropTypes.number,
    quantity: PropTypes.number,
    decreaseDisabled: PropTypes.bool,
    increaseDisabled: PropTypes.bool,
    onDecrease: PropTypes.func,
    onIncrease: PropTypes.func,
  };

  static defaultProps = {
    image: '',
    variation: '',
    decreaseDisabled: false,
    increaseDisabled: false,
    onDecrease: () => {},
    onIncrease: () => {},
  };

  render() {
    const {
      image,
      title,
      variation,
      price,
      quantity,
      decreaseDisabled,
      increaseDisabled,
      onDecrease,
      onIncrease,
    } = this.props;

    return (
      <li className="item border-botton__divider flex flex-top">
        <Image className="item__image-container" src={image} />
        <div className="item__content flex flex-middle flex-space-between">
          <div className="item__detail">
            <summary className="item__title font-weight-bold">{title}</summary>
            {variation ? <p className="item__description">{variation}</p> : null}
            <span className="gray-font-opacity"><CurrencyNumber money={price} /></span>
          </div>
          <div className={`item__cart-ctrl ${quantity > 0 ? 'is-minuts' : ''} flex flex-middle flex-space-between`}>
            <button
              className="cart__ctrl cart__minuts"
              disabled={decreaseDisabled}
              onClick={onDecrease}
            >
              <i className="cart__icon"></i>
            </button>

            {
              quantity > 0 ? (
                <span className="font-weight-bold">{quantity}</span>
              ) : null
            }

            <button
              className="cart__ctrl cart__add"
              onClick={onIncrease}
              disabled={increaseDisabled}
            >
              <i className="cart__icon"></i>
            </button>
          </div>
        </div>
      </li>
    )
  }
}

export default ItemComponent
