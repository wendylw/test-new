import React from 'react';
import { connect } from 'react-redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';

class CurrencyNumber extends React.Component {
  formatChildrenAsMoney() {
    const { locale, currency, money } = this.props;

    if (!(locale && currency)) {
      return money;
    }

    return Intl.NumberFormat(
      locale,
      { style: 'currency', currency }
    ).format(parseFloat(money));
  }

  render() {
    const { classList, addonBefore } = this.props;

    return <span className={classList}>{`${addonBefore ? `${addonBefore} ` : ''}${this.formatChildrenAsMoney()}`}</span>;
  }
}

export default connect(
  (state) => {
    const { locale, currency } = getOnlineStoreInfo(state);
    return {
      locale,
      currency,
    };
  }
)(CurrencyNumber);
