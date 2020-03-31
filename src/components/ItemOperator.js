import React, { Component } from 'react';
import PropTypes from 'prop-types';

export class ItemOperator extends Component {
  render() {
    const { quantity, className, decreaseDisabled, increaseDisabled, onDecrease, onIncrease } = this.props;
    const classList = [`item__cart-ctrl flex flex-space-between ${quantity > 0 ? 'is-minus' : ''}`];

    if (className) {
      classList.push(className);
    }

    return (
      <div className={classList.join(' ')}>
        {onDecrease ? (
          <button className="cart__ctrl-container" disabled={decreaseDisabled} onClick={onDecrease}>
            <i className="cart__ctrl cart__minus">
              <span className="cart__icon"></span>
            </i>
          </button>
        ) : null}

        {quantity > 0 ? <span className="font-weight-bold">{quantity}</span> : null}

        {onIncrease ? (
          <button className="cart__ctrl-container" onClick={onIncrease} disabled={increaseDisabled}>
            <i className="cart__ctrl cart__add">
              <span className="cart__icon"></span>
            </i>
          </button>
        ) : null}
      </div>
    );
  }
}

ItemOperator.propTypes = {
  className: PropTypes.string,
  decreaseDisabled: PropTypes.bool,
  increaseDisabled: PropTypes.bool,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  quantity: PropTypes.number,
};

ItemOperator.defaultProps = {
  decreaseDisabled: false,
  increaseDisabled: false,
};

export default ItemOperator;
