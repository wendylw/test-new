import React from 'react';
import PropTypes from 'prop-types';

class CurrencyNumber extends React.Component {
  formatChildrenAsPrice() {
    const { locale, currency, price } = this.props;

    if (!(locale && currency)) {
      return price;
    }

    return Intl.NumberFormat(locale, { style: 'currency', currency }).format(parseFloat(price || 0));
  }

  render() {
    const { className, addonBefore } = this.props;

    return (
      <span className={className}>{`${addonBefore ? `${addonBefore} ` : ''}${this.formatChildrenAsPrice()}`}</span>
    );
  }
}
CurrencyNumber.displayName = 'SiteCurrencyNumber';

CurrencyNumber.propTypes = {
  className: PropTypes.string,
  addonBefore: PropTypes.string,
  locale: PropTypes.string,
  currency: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

CurrencyNumber.defaultProps = {
  className: '',
  addonBefore: '',
  locale: '',
  currency: '',
  price: 0,
};

export default CurrencyNumber;
