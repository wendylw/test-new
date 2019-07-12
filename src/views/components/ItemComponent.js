import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CurrencyNumber from './CurrencyNumber';
import Image from './Image';
import SoldOutMark from './SoldOutMark';

export class ItemComponent extends Component {
  static propTypes = {
    image: PropTypes.string,
    title: PropTypes.string,
    variation: PropTypes.string,
    price: PropTypes.number,
    quantity: PropTypes.number,
    decreaseDisabled: PropTypes.bool,
    increaseDisabled: PropTypes.bool,
    soldOut: PropTypes.bool,
    onDecrease: PropTypes.func,
    onIncrease: PropTypes.func,
  };

  static defaultProps = {
    image: '',
    variation: '',
    decreaseDisabled: false,
    increaseDisabled: false,
    soldOut: false,
    onDecrease: () => { },
    onIncrease: () => { },
  };

  render() {
    const {
      className = '',
      image,
      title,
      variation,
      price,
    } = this.props;

    return (
      <li className={`item border__bottom-divider flex flex-top ${className}`}>
        <Image className="item__image-container" src={image} />
        <div className="item__content flex flex-middle flex-space-between">
          <div className="item__detail">
            <summary className="item__title font-weight-bold">{title}</summary>
            {variation ? <p className="item__description">{variation}</p> : null}
            <span className="gray-font-opacity"><CurrencyNumber money={price || 0} /></span>
          </div>

          {this.renderOperators()}
        </div>
      </li>
    )
  }

  renderOperators = () => {
    const {
      quantity,
      decreaseDisabled,
      increaseDisabled,
      soldOut,
      onDecrease,
      onIncrease,
    } = this.props;

    if (soldOut) {
      return (
        <SoldOutMark />
      )
    }

    return (
      <div className={`item__cart-ctrl ${quantity > 0 ? 'is-minuts' : ''} flex flex-middle flex-space-between`}>
        <button
          className="cart__ctrl-container"
          disabled={decreaseDisabled}
          onClick={onDecrease}
        >
          <i className="cart__ctrl cart__minuts">
            <span className="cart__icon"></span>
          </i>
        </button>

        {
          quantity > 0 ? (
            <span className="font-weight-bold">{quantity}</span>
          ) : null
        }

        <button
          className="cart__ctrl-container"
          onClick={onIncrease}
          disabled={increaseDisabled}
        >
          <i className="cart__ctrl cart__add">
            <span className="cart__icon"></span>
          </i>
        </button>
      </div>
    )
  }
}

export default ItemComponent
