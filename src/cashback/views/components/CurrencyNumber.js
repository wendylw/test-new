import React from 'react';
import { connect } from 'react-redux';

class CurrencyNumber extends React.Component {
  formatChildrenAsMoney() {
    const { money, storeInfo } = this.props;
    const { locale, currency } = storeInfo || {};

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
  storeInfo: state.home.storeInfo,
});

export default connect(mapStateToProps)(CurrencyNumber);
