import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Link } from 'react-router-dom';
import PhoneView from '../../../../../components/PhoneView';
import CurrencyNumber from '../../../../components/CurrencyNumber';


import qs from 'qs';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo } from '../../../../redux/modules/app';
import { actions as thankYouActions, getBusinessInfo, getCashbackInfo } from '../../../../redux/modules/thankYou';

const ORDER_CAN_CLAIM = 'Can_Claim';
const ANIMATION_TIME = 3600;
const CLAIMED_ANIMATION_GIF = '/img/succeed-animation.gif';

class PhoneViewContainer extends React.Component {
	animationSetTimeout = null;

	state = {
		phone: Utils.getPhoneNumber(),
		isSavingPhone: false,
		redirectURL: null,
		showCelebration: true,
		claimedAnimationGifSrc: null
	}

	async componentWillMount() {
		const {
			cashbackInfo,
			thankYouActions,
		} = this.props;
		const { status } = cashbackInfo || {};
		let showCelebration = true;

		await thankYouActions.getCashbackInfo();

		if (status && status !== ORDER_CAN_CLAIM) {
			showCelebration = false;

			this.createCustomerCashbackInfo();
		}

		this.setState({ showCelebration });
	}

	componentDidMount() {
		this.setState({
			claimedAnimationGifSrc: CLAIMED_ANIMATION_GIF
		});
	}

	componentWillUpdate(nextProps, nextState) {
		if (nextState.showCelebration && nextState.redirectURL) {
			this.animationSetTimeout = setTimeout(() => {
				this.setState({ showCelebration: false });

				clearTimeout(this.animationSetTimeout);
			}, ANIMATION_TIME);
		}
	}

	async createCustomerCashbackInfo() {
		const { thankYouActions } = this.props;
		let redirectURL = null;

		await thankYouActions.createCashbackInfo(this.getOrderInfo());

		const { cashbackInfo } = this.props;
		const { customerId } = cashbackInfo || {};

		if (customerId) {
			redirectURL = `${Constants.ROUTER_PATHS.CASHBACK_HOME}?customerId=${customerId}`;
		}

		this.setState({
			isSavingPhone: false,
			redirectURL,
		});
	}

	getOrderInfo() {
		const { history } = this.props;
		const { phone } = this.state;
		const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

		return {
			phone,
			receiptNumber,
			source: Constants.CASHBACK_SOURCE.QR_ORDERING
		};
	}

	handleUpdatePhoneNumber(phone) {
		this.setState({ phone });
	}

	renderCurrencyNumber() {
		const { cashbackInfo } = this.props;
		const { cashback } = cashbackInfo || {};

		if (!cashback) {
			return null;
		}

		return (
			<CurrencyNumber
				className="font-weight-bold"
				money={Math.abs(cashback || 0)}
			/>
		);
	}

	renderPhoneView() {
		const {
			cashbackInfo,
			onlineStoreInfo,
		} = this.props;
		const {
			isSavingPhone,
			redirectURL,
			phone,
		} = this.state;
		const { country } = onlineStoreInfo || {};
		const { status } = cashbackInfo || {};

		if (status !== ORDER_CAN_CLAIM) {
			return redirectURL
				? (
					<BrowserRouter basename="/">
						<Link
							className="button__fill link__non-underline link__block border-radius-base font-weight-bold text-uppercase"
							to={redirectURL}
							target="_blank"
						>Check My Balance</Link>
					</BrowserRouter>
				)
				: null;
		}

		return (
			<PhoneView
				phone={phone}
				country={country}
				setPhone={this.handleUpdatePhoneNumber.bind(this)}
				submitPhoneNumber={this.createCustomerCashbackInfo.bind(this)}
				isLoading={isSavingPhone}
				buttonText="Continue"
			/>
		);
	}

	render() {
		const {
			cashbackInfo,
			businessInfo,
			onlineStoreInfo,
		} = this.props;
		const {
			claimedAnimationGifSrc,
			showCelebration,
			redirectURL,
		} = this.state;
		const {
			cashback,
			status
		} = cashbackInfo || {};
		const { country } = onlineStoreInfo || {};
		const { enableCashback } = businessInfo || {};

		if (!country || !cashback || !enableCashback) {
			return null;
		}

		return (
			<div className={`thanks__phone-view ${showCelebration && redirectURL ? 'active' : ''}`}>
				{
					status !== ORDER_CAN_CLAIM
						? (
							<label className="phone-view-form__label text-center">
								You’ve earned {this.renderCurrencyNumber()} Cashback!
							</label>
						)
						: (
							<label className="phone-view-form__label text-center">
								Earn {this.renderCurrencyNumber()} Cashback with Your Mobile Number
							</label>
						)
				}
				{this.renderPhoneView()}

				<p className="terms-privacy text-center gray-font-opacity">
					By tapping to continue, you agree to our
          <br />
					<BrowserRouter basename="/">
						<Link target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}><strong>Terms of Service</strong></Link>, and <Link target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}><strong>Privacy Policy</strong></Link>.
					</BrowserRouter>
				</p>
				<div className="thanks__suceed-animation">
					<img src={claimedAnimationGifSrc} alt="Beep Claimed" />
				</div>
			</div>
		);
	}
}

PhoneView.propTypes = {
	onlineStoreInfo: PropTypes.object,
};

PhoneView.defaultProps = {
	onlineStoreInfo: {},
};

export default connect(
	(state) => ({
		onlineStoreInfo: getOnlineStoreInfo(state),
		businessInfo: getBusinessInfo(state),
		cashbackInfo: getCashbackInfo(state),
	}),
	(dispatch) => ({
		thankYouActions: bindActionCreators(thankYouActions, dispatch),
	})
)(PhoneViewContainer);