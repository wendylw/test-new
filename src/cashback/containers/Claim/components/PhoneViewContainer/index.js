import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import PhoneView from '../../../../../components/PhoneView';

import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo } from '../../../../redux/modules/app';
import { actions as claimActions, getCashbackInfo, getHashData } from '../../../../redux/modules/claim';

class PhoneViewContainer extends React.Component {
	animationSetTimeout = null;

	state = {
		phone: Utils.getPhoneNumber(),
		isSavingPhone: false,
	}

	getOrderInfo() {
		const { hashData } = this.props;
		const { phone } = this.state;
		const { receiptNumber = '' } = hashData || {};

		return {
			phone,
			receiptNumber,
			source: Constants.CASHBACK_SOURCE.QR_ORDERING
		};
	}

	async handleCreateCustomerCashbackInfo() {
		const {
			history,
			claimActions,
		} = this.props;

		await claimActions.createCashbackInfo(this.getOrderInfo());

		const { cashbackInfo } = this.props;
		const { customerId } = cashbackInfo || {};

		if (customerId) {
			history.push({
				pathname: Constants.ROUTER_PATHS.CASHBACK_HOME,
				search: `?customerId=${customerId || ''}`
			});
		}
	}

	handleUpdatePhoneNumber(phone) {
		this.setState({ phone });
	}

	render() {
		const { onlineStoreInfo } = this.props;
		const {
			isSavingPhone,
			phone,
		} = this.state;
		const { country } = onlineStoreInfo || {};

		if (!country) {
			return null;
		}

		return (
			<aside className="aside-bottom not-full">
				<label className="phone-view-form__label text-center">Claim with your mobile number</label>
				<PhoneView
					phone={phone}
					country={country}
					setPhone={this.handleUpdatePhoneNumber.bind(this)}
					submitPhoneNumber={this.handleCreateCustomerCashbackInfo.bind(this)}
					isLoading={isSavingPhone}
					buttonText="Continue"
				/>
				<p className="terms-privacy text-center gray-font-opacity">
					By tapping to continue, you agree to our<br />
					<BrowserRouter basename="/">
						<Link target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}><strong>Terms of Service</strong></Link>, and <Link target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}><strong>Privacy Policy</strong></Link>.
					</BrowserRouter>
				</p>
			</aside>
		);
	}
}

export default connect(
	(state) => ({
		onlineStoreInfo: getOnlineStoreInfo(state),
		cashbackInfo: getCashbackInfo(state),
		hashData: getHashData(state),
	}),
	(dispatch) => ({
		claimActions: bindActionCreators(claimActions, dispatch),
	})
)(PhoneViewContainer);