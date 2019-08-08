import React from 'react';
import PropTypes from 'prop-types';

class CurrencyNumber extends React.Component {
	formatChildrenAsMoney() {
		const { locale, currency, money } = this.props;

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

CurrencyNumber.propTypes = {
	classList: PropTypes.string,
	locale: PropTypes.string,
	currency: PropTypes.string,
	money: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
};

export default CurrencyNumber;