import React from 'react';
// import { Link } from 'react-router-dom';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import qs from 'qs';
// import Message from './components/Message';

// import CurrencyNumber from '../../components/CurrencyNumber';
// import Image from '../../../components/Image';

import 'react-phone-number-input/style.css';
// import Utils from '../../../utils/utils';
// import Constants from '../../../utils/constants';
// import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
// import { tryOtpAndSaveCashback, fetchPhone, setPhone, getCashbackAndHashData } from '../../../cashback-demo/actions';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');


class PageClaim extends React.Component {
	state = {}

	// componentWillMount() {
	// 	const {
	// 		history,
	// 		getCashbackAndHashData,
	// 	} = this.props;
	// 	const { h = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

	// 	getCashbackAndHashData(encodeURIComponent(h));
	// }

	// componentWillReceiveProps(nextProps) {
	// 	const { isLoading } = nextProps;

	// 	if (isLoading !== this.state.isLoading) {
	// 		this.setState({ isLoading });
	// 	}
	// }

	// toggleVerifyModal(flag) {
	// 	if (typeof flag === 'boolean') {
	// 		this.setState({ showVerify: flag });
	// 		return;
	// 	}

	// 	this.setState({ showVerify: !this.state.showVerify });
	// }

	// savePhoneNumber() {
	// 	const { submitPhoneNumber, phone } = this.props;

	// 	if (!isValidPhoneNumber(phone)) {
	// 		return;
	// 	}

	// 	this.setState({ isLoading: true });

	// 	submitPhoneNumber();
	// }

	// renderCashback() {
	// 	const { cashback, defaultLoyaltyRatio } = this.props;
	// 	let percentage = defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : 5;
	// 	const cashbackNumber = Number(cashback);

	// 	if (!cashback && !defaultLoyaltyRatio) {
	// 		return null;
	// 	}

	// 	if (!isNaN(cashbackNumber) && cashbackNumber) {
	// 		return <CurrencyNumber classList="cash-back__money" money={cashback} />;
	// 	}

	// 	return <span className="cash-back__money">{`${percentage}% Cashback`}</span>;
	// }

	render() {
		// const { logo, business, store = {} } = this.props;
		// const { displayBusinessName, name } = business || {};
		// const { city } = store || {};
		// const addressInfo = [displayBusinessName || name, city].filter(v => v);
		// const {
		// 	className,
		// 	phone,
		// 	setPhone,
		// 	country,
		// 	buttonText,
		// } = this.props;
		// const {
		// 	isLoading,
		// 	errorMessage,
		// } = this.state;
		// let buttonContent = buttonText;

		// if (isLoading) {
		// 	buttonContent = <div className="loader"></div>;
		// }

		return (
			<section className="cash-back flex-column" style={{
				// backgroundImage: `url(${theImage})`,
			}}>

			</section>
		);
	}
}

export default PageClaim;

// const mapStateToProps = state => {
// 	const business = state.common.business || {};

// 	return {
// 		phone: state.user.phone,
// 		isLoading: state.user.isLoading,
// 		country: business.country,
// 	};
// };

// const mapDispatchToProps = dispatch => bindActionCreators({
// 	tryOtpAndSaveCashback,
// 	fetchPhone,
// 	setPhone,
// 	getCashbackAndHashData,
// }, dispatch);

// PageClaim.propTypes = {
// 	onlineStoreInfo: PropTypes.object,
// };

// PageClaim.defaultProps = {
// 	onlineStoreInfo: {}
// };

// export default connect(mapStateToProps, mapDispatchToProps)(PageClaim);
