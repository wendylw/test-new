import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getBusinessInfo, getOnlineStoreInfo } from '../../redux/modules/app';
import Utils from '../../../utils/utils';

class CurrencyNumber extends React.Component {
  formatChildrenAsMoney() {
    const { locale, currency, money, country } = this.props;
    const isSafari = Utils.getUserAgentInfo().browser.includes('Safari');

    if (!(locale && currency)) {
      return money;
    }

    const price = Intl.NumberFormat(locale, { style: 'currency', currency }).format(parseFloat(money));

    if (country === 'MY' && isSafari) {
      return price.replace(/^(\D+)/, '$1 ');
    }

    return price;
  }

  render() {
    const { className, addonBefore } = this.props;

    return (
      <span className={className}>{`${addonBefore ? `${addonBefore} ` : ''}${this.formatChildrenAsMoney()}`}</span>
    );
  }
}

CurrencyNumber.propTypes = {
  className: PropTypes.string,
  addonBefore: PropTypes.string,
  money: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

CurrencyNumber.defaultProps = {
  money: 0,
};

export default connect(state => {
  const onlineStoreInfo = getOnlineStoreInfo(state) || {};
  const businessInfo = getBusinessInfo(state) || {};

  return {
    locale: onlineStoreInfo.locale || businessInfo.locale,
    currency: onlineStoreInfo.currency || businessInfo.currency,
    country: onlineStoreInfo.country || businessInfo.country,
  };
})(CurrencyNumber);
