import React from 'react';
import { Link } from 'react-router-dom';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import qs from 'qs';
// import Message from './components/Message';

import CurrencyNumber from '../../components/CurrencyNumber';
import Image from '../../../components/Image';
import Constants from '../../../utils/constants';

import 'react-phone-number-input/style.css';
// import Utils from '../../../utils/utils';
// import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
// import { tryOtpAndSaveCashback, fetchPhone, setPhone, getCashbackAndHashData } from '../../../cashback-demo/actions';

// const metadataMobile = require('libphonenumber-js/metadata.mobile.json');


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
				<article className="cash-back__home text-center">
					<Image className="logo-default__image-container" src="" alt="" />
					<h5 className="logo-default__title text-uppercase">Earn cashback now</h5>
					<CurrencyNumber className="cash-back__money" money={0} />
					<span className="cash-back__money">{`${0}% Cashback`}</span>
					<div className="location">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
							<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
							<path d="M0 0h24v24H0z" fill="none" />
						</svg>
						<span className="location__text text-middle">
							wendy, Shanghai
						</span>
					</div>
				</article>
				<div className="asdie-section">
					<aside className="aside-bottom not-full">
						<label className="phone-view-form__label text-center">Claim with your mobile number</label>
						<button className="phone-view-form__button button__fill button__block border-radius-base font-weight-bold text-uppercase">Continue</button>
						<p className="terms-privacy text-center gray-font-opacity">
							By tapping to continue, you agree to our<br /><Link target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}><strong>Terms of Service</strong></Link>,
							and <Link target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}><strong>Privacy Policy</strong></Link>.
          	</p>
					</aside>
				</div>
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
