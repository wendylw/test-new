import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withDataAttributes from './withDataAttributes';

export class ItemOperator extends Component {
  render() {
    const {
      quantity,
      className,
      decreaseDisabled,
      increaseDisabled,
      onDecrease,
      onIncrease,
      dataAttributes,
    } = this.props;
    const classList = [`item__cart-ctrl flex flex-space-between ${quantity > 0 ? 'is-minus' : ''}`];

    if (className) {
      classList.push(className);
    }

    return (
      <div className={classList.join(' ')} {...dataAttributes}>
        {onDecrease ? (
          <button
            className="cart__ctrl-container"
            disabled={decreaseDisabled}
            onClick={onDecrease}
            data-testid="itemDecrease"
            data-heap-name="common.item-operator.decrease"
          >
            <i className="cart__ctrl cart__minus">
              <span className="cart__icon"></span>
            </i>
          </button>
        ) : null}

        {quantity > 0 ? (
          <span
            className="text-weight-bolder"
            data-testid="itemDetailQuantity"
            data-heap-name="common.item-operator.quantity"
          >
            {quantity}
          </span>
        ) : null}

        {onIncrease ? (
          <button
            className="cart__ctrl-container"
            onClick={onIncrease}
            disabled={increaseDisabled}
            data-testid="itemIncrease"
            data-heap-name="common.item-operator.increase"
          >
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

export default withDataAttributes(ItemOperator);
