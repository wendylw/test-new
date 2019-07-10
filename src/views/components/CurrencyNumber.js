import React from 'react';
import { compose } from 'react-apollo';
import withOnlineStoreInfo from '../../libs/withOnlineStoreInfo';

class CurrencyNumber extends React.Component {
  formatChildrenAsMoney() {
    const { gqlOnlineStoreInfo, money } = this.props;
    const { onlineStoreInfo = {} } = gqlOnlineStoreInfo;
    const { locale, currency } = onlineStoreInfo;

    if (!locale || !currency) {
      return money;
    }

    return Intl.NumberFormat(locale, { style: 'currency', currency }).format(parseFloat(money));
  }

  render() {
    const { classList, addonBefore } = this.props;

    return <span className={classList}>{`${addonBefore ? `${addonBefore} ` : ''}${this.formatChildrenAsMoney()}`}</span>;
  }
}

export default compose(
  withOnlineStoreInfo(),
)(CurrencyNumber);
