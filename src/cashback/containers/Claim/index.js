import React from 'react';
import qs from 'qs';
import CurrencyNumber from '../../components/CurrencyNumber';
import { IconPin } from '../../../components/Icons';
import Image from '../../../components/Image';

import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo, getUser } from '../../redux/modules/app';
import { actions as claimActions, getBusinessInfo, getCashbackInfo, getReceiptNumber } from '../../redux/modules/claim';


class PageClaim extends React.Component {
	state = {
		phone: Utils.getLocalStorageVariable('user.p'),
	}

	async componentWillMount() {
		const {
			user,
			history,
			claimActions,
		} = this.props;
		const {
			isWebview,
			isLogin,
		} = user || {};
		const { h = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

		await claimActions.getCashbackReceiptNumber(encodeURIComponent(h));

		const { receiptNumber } = this.props;

		if (receiptNumber) {
			await claimActions.getCashbackInfo(receiptNumber);
		}

		if (isWebview && isLogin) {
			this.handleCreateCustomerCashbackInfo();
		}
	}

	componentDidUpdate(prevProps) {
		const { receiptNumber, user } = this.props;
		const {
			isWebview,
			isLogin,
		} = user || {};
		const valid = prevProps.user.isLogin !== isLogin || prevProps.receiptNumber !== receiptNumber;

		if (valid && isWebview && isLogin && receiptNumber) {
			this.handleCreateCustomerCashbackInfo();
		}
	}

	getOrderInfo() {
		const { receiptNumber } = this.props;
		const { phone } = this.state;

		return {
			phone,
			receiptNumber,
			source: Constants.CASHBACK_SOURCE.RECEIPT
		};
	}

	async handleCreateCustomerCashbackInfo() {
		const {
			user,
			history,
			claimActions,
		} = this.props;
		const { isWebview } = user || {};
		const { phone } = this.state;

		Utils.setLocalStorageVariable('user.p', phone);
		await claimActions.createCashbackInfo(this.getOrderInfo());

		const { cashbackInfo } = this.props;
		const { customerId } = cashbackInfo || {};

		if (!customerId) {
			return null;
		}

		if (isWebview) {
			this.handlePostLoyaltyPageMessage();
		} else {
			history.push({
				pathname: Constants.ROUTER_PATHS.CASHBACK_HOME,
				search: `?customerId=${customerId || ''}`
			});
		}
	}

	handlePostLoyaltyPageMessage() {
		const { user } = this.props;
		const { isWebview } = user || {};

		if (isWebview) {
			window.ReactNativeWebView.postMessage('goToLoyaltyPage');
		}

		return;
	}

	renderCashback() {
		const { cashbackInfo } = this.props;
		const {
			cashback,
			defaultLoyaltyRatio,
		} = cashbackInfo || {};
		let percentage = defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : 5;
		const cashbackNumber = Number(cashback);

		if (!cashback && !defaultLoyaltyRatio) {
			return null;
		}

		if (!isNaN(cashbackNumber) && cashbackNumber) {
			return <CurrencyNumber className="loyalty__money" money={cashback} />;
		}

		return <span className="loyalty__money">{`${percentage}% Cashback`}</span>;
	}

	renderLocation() {
		const {
			cashbackInfo,
			businessInfo,
		} = this.props;
		const {
			name,
			displayBusinessName,
		} = businessInfo || {};
		const { store } = cashbackInfo || {};
		const { city } = store || {};
		const addressInfo = [displayBusinessName || name, city].filter(v => v);

		return (
			<div className="location">
				<IconPin />
				<span className="location__text text-middle">{addressInfo.join(', ')}</span>
			</div>
		);
	}

	render() {
		const {
			user,
			onlineStoreInfo,
			businessInfo,
		} = this.props;
		const { isWebview } = user;
		const { logo } = onlineStoreInfo || {};
		const {
			name,
			displayBusinessName,
		} = businessInfo || {};

		return (
			<section className="loyalty__claim" style={{
				// backgroundImage: `url(${theImage})`,
			}}>
				<article className="loyalty__content text-center">
					{
						logo
							? <Image className="logo-default__image-container" src={logo} alt={displayBusinessName || name} />
							: null
					}
					<h5 className="logo-default__title text-uppercase">Earn cashback now</h5>

					{this.renderCashback()}

					{this.renderLocation()}
				</article>
				{
					isWebview
						? (
							<div className="loading-cover">
								<i className="loader theme page-loader"></i>
							</div>
						)
						: null
				}
			</section>
		);
	}
}

export default connect(
	(state) => ({
		user: getUser(state),
		onlineStoreInfo: getOnlineStoreInfo(state),
		businessInfo: getBusinessInfo(state),
		cashbackInfo: getCashbackInfo(state),
		receiptNumber: getReceiptNumber(state),
	}),
	(dispatch) => ({
		claimActions: bindActionCreators(claimActions, dispatch),
	})
)(PageClaim);
