import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withDataAttributes from './withDataAttributes';
import './ItemOperator.scss';

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
      from,
    } = this.props;
    const classList = [
      `item-operator flex flex-space-between ${
        (from === 'productDetail' ? quantity >= 0 : quantity > 0) ? 'item-operator--minus' : ''
      }`,
    ];

    if (className) {
      classList.push(className);
    }

    return (
      <div className={classList.join(' ')} {...dataAttributes}>
        {onDecrease ? (
          <button
            className="item-operator__button item-operator__button-minus padding-top-bottom-small padding-left-right-smaller item-operator__button-decrease"
            disabled={decreaseDisabled}
            onClick={onDecrease}
            data-testid="itemDecrease"
            data-heap-name="common.item-operator.decrease"
          >
            <i className="item-operator__ctrl item-operator__minus margin-smaller">
              <span className="item-operator__icon"></span>
            </i>
          </button>
        ) : null}

        <span
          className="item-operator__quantity text-center text-weight-bolder"
          data-testid="itemDetailQuantity"
          data-heap-name="common.item-operator.quantity"
        >
          {(from === 'productDetail' ? quantity >= 0 : quantity > 0) ? quantity : null}
        </span>

        {onIncrease ? (
          <button
            className="item-operator__button padding-top-bottom-small padding-left-right-smaller item-operator__button-increase"
            onClick={onIncrease}
            disabled={increaseDisabled}
            data-testid="itemIncrease"
            data-heap-name="common.item-operator.increase"
          >
            <i className="item-operator__ctrl item-operator__add margin-smaller">
              <span className="item-operator__icon"></span>
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
  from: PropTypes.string,
};

ItemOperator.defaultProps = {
  decreaseDisabled: false,
  increaseDisabled: false,
  from: 'home',
};
export const ItemOperatorComponent = ItemOperator;
export default withDataAttributes(ItemOperator);
