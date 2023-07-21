import React from 'react';
import PropTypes from 'prop-types';
import { extractDataAttributes } from '../common/utils';
import './ItemOperator.scss';

const ItemOperator = props => {
  const {
    quantity,
    className,
    decreaseDisabled,
    increaseDisabled,
    onDecrease,
    onIncrease,
    dataAttributes,
    from,
  } = props;
  const classList = [
    `item-operator flex flex-space-between ${
      (from === 'productDetail' ? quantity >= 0 : quantity > 0) ? 'item-operator--minus' : ''
    }`,
  ];

  if (className) {
    classList.push(className);
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div className={classList.join(' ')} {...extractDataAttributes(this.props)}>
      {onDecrease ? (
        <button
          className="item-operator__button item-operator__button-minus padding-top-bottom-small padding-left-right-smaller item-operator__button-decrease"
          disabled={decreaseDisabled}
          onClick={onDecrease}
          data-testid="itemDecrease"
        >
          <i className="item-operator__ctrl item-operator__minus margin-smaller">
            <span className="item-operator__icon" />
          </i>
        </button>
      ) : null}

      <span className="item-operator__quantity text-center text-weight-bolder" data-testid="itemDetailQuantity">
        {(from === 'productDetail' ? quantity >= 0 : quantity > 0) ? quantity : null}
      </span>

      {onIncrease ? (
        <button
          className="item-operator__button padding-top-bottom-small padding-left-right-smaller item-operator__button-increase"
          onClick={onIncrease}
          disabled={increaseDisabled}
          data-testid="itemIncrease"
        >
          <i className="item-operator__ctrl item-operator__add margin-smaller">
            <span className="item-operator__icon" />
          </i>
        </button>
      ) : null}
    </div>
  );
};

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
  className: '',
  decreaseDisabled: false,
  increaseDisabled: false,
  onDecrease: () => {},
  onIncrease: () => {},
  quantity: 0,
  from: 'home',
};
ItemOperator.displayName = 'ItemOperator';
export const ItemOperatorComponent = ItemOperator;
export default ItemOperator;
