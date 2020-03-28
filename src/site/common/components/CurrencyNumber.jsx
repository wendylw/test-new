import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';

class CurrencyNumber extends React.Component {
  formatChildrenAsMoney() {
    const { onlineStoreInfo, money } = this.props;
    const { locale, currency } = onlineStoreInfo || {};

    if (!(locale && currency)) {
      return money;
    }

    return Intl.NumberFormat(locale, { style: 'currency', currency }).format(parseFloat(money));
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

export default connect(state => ({
  onlineStoreInfo: getOnlineStoreInfo(state),
}))(CurrencyNumber);
