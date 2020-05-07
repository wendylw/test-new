import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';
import Utils from '../../../utils/utils';

class CurrencyNumber extends React.Component {
  formatChildrenAsMoney() {
    const { locale, currency, money, country, numberOnly } = this.props;
    const isSafari = Utils.getUserAgentInfo().browser.includes('Safari');

    if (!(locale && currency)) {
      return money;
    }

    const price = numberOnly
      ? Intl.NumberFormat(locale, {
          style: 'decimal',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(parseFloat(money))
      : Intl.NumberFormat(locale, { style: 'currency', currency }).format(parseFloat(money));

    if (country === 'MY' && isSafari) {
      return price.replace(/^(\D+)/, '$1 ');
    }

    return price;
  }

  render() {
    const { className, addonBefore } = this.props;

    return (
      <span className={`text-nowrap ${className}`}>{`${
        addonBefore ? `${addonBefore} ` : ''
      }${this.formatChildrenAsMoney()}`}</span>
    );
  }
}

CurrencyNumber.propTypes = {
  className: PropTypes.string,
  addonBefore: PropTypes.string,
  money: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  numberOnly: PropTypes.bool,
};

CurrencyNumber.defaultProps = {
  money: 0,
  numberOnly: false,
};

export default connect(state => {
  const { locale, currency, country } = getOnlineStoreInfo(state) || {};

  return {
    locale,
    currency,
    country,
  };
})(CurrencyNumber);
