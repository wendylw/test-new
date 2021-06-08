import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CurrencyNumber from '../../../../components/CurrencyNumber';

class OrderInfo extends Component {
  render() {
    const { logo, money } = this.props;

    return (
      <div className="payment__info">
        <figure className="logo-default__image-container">
          <img src={logo} alt="" />
        </figure>
        <CurrencyNumber className="payment-credit-card__money text-weight-bolder text-center" money={money} />
      </div>
    );
  }
}

OrderInfo.propTypes = {
  logo: PropTypes.string,
  money: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

OrderInfo.defaultProps = {
  logo: '',
  money: 0,
};

export default OrderInfo;
