import React from 'react';
import { connect } from 'react-redux';

class CurrencyNumber extends React.Component {
  formatChildrenAsMoney() {
    const { money, onlineStoreInfo } = this.props;
    const { locale, currency } = onlineStoreInfo || {};

    if (!locale || !currency) {
      return money;
    }

    return Intl.NumberFormat(locale, { style: 'currency', currency }).format(parseFloat(money));
  }

  render() {
    const { classList } = this.props;
    return <span className={classList}>{this.formatChildrenAsMoney()}</span>;
  }
}

const mapStateToProps = state => ({
  onlineStoreInfo: state.common.onlineStoreInfo,
});

export default connect(mapStateToProps)(CurrencyNumber);
