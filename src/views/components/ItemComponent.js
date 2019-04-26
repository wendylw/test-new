import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CurrencyNumber from './CurrencyNumber';

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
      <div style={{ position: 'relative' }}>
        {image ? <img src={image} width={68} height={68} alt={title} /> : null}
        <span style={{ display: 'inline-block', verticalAlign: 'top' }}>
          <div>{title}</div>
          {variation ? <div>{variation}</div> : null}
          <div><CurrencyNumber money={price} /></div>
        </span>
        <span style={{ display: 'inline-block', position: 'absolute', top: '30%', right: 5 }}>
          {quantity > 0 ? <button onClick={onDecrease} disabled={decreaseDisabled}>-</button> : null}
          {quantity > 0 ? quantity : null}
          <button onClick={onIncrease} disabled={increaseDisabled}>+</button>
        </span>
      </div>
    )
  }
}

export default ItemComponent
