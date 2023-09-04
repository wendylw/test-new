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

    const formatPrice = numberOnly
      ? Intl.NumberFormat(locale, {
          style: 'decimal',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(parseFloat(money))
      : Intl.NumberFormat(locale, { style: 'currency', currency }).format(parseFloat(money));

    // fix Intl.NumberFormat did not work on wechat webview in some version and some device
    const price = formatPrice === null || formatPrice === '' ? money : formatPrice;

    if (country === 'MY' && isSafari) {
      return price.replace(/^(\D+)/, '$1 ');
    }

    return price;
  }

  render() {
    const { className, addonBefore } = this.props;

    return (
      <span className={`${className}`} data-testid="money">{`${
        addonBefore ? `${addonBefore} ` : ''
      }${this.formatChildrenAsMoney()}`}</span>
    );
  }
}

CurrencyNumber.displayName = 'OrderingCurrencyNumber';

CurrencyNumber.propTypes = {
  locale: PropTypes.string,
  currency: PropTypes.string,
  country: PropTypes.string,
  className: PropTypes.string,
  addonBefore: PropTypes.string,
  money: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  numberOnly: PropTypes.bool,
};

CurrencyNumber.defaultProps = {
  money: 0,
  locale: '',
  currency: '',
  country: '',
  className: '',
  addonBefore: '',
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
