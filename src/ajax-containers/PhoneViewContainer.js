import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import qs from 'qs';
import Utils from '../libs/utils';
import GlobalConstants from '../Constants';
import api from '../cashback/utils/api';
import Constants from '../cashback/utils/Constants';
import PhoneView from '../components/PhoneView';
import CurrencyNumber from '../components/CurrencyNumber';

class PhoneViewContainer extends React.Component {

	state = {
		cashbackInfoResponse: {},
		isSavingPhone: false,
		redirectURL: null
	}

	componentWillMount() {
		this.cashbackAjax('get');
	}

	async cashbackAjax(method) {
		const { history } = this.props;
		const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
		const options = Object.assign({
			url: `${Constants.api.CASHBACK}${method === 'post' ? `?receiptNumber=${receiptNumber}` : ''}`,
			method
		}, method === 'post' ? {
			data: {
				phone: Utils.getPhoneNumber(),
				receiptNumber,
				source: GlobalConstants.CASHBACK_SOURCE.QR_ORDERING
			}
		} : {});
		const { data } = await api(options);
		let redirectURL = null;

		if (method === 'get') {
			this.setState({
				cashbackInfoResponse: data
			});
		} else if (method === 'post') {
			const { customerId } = data;

			redirectURL = `${GlobalConstants.ROUTER_PATHS.CASHBACK_HOME}?customerId=${customerId}`;
		}

		this.setState({
			isSavingPhone: false,
			redirectURL
		});
	}

	renderCurrencyNumber() {
		const { onlineStoreInfo: {
			locale,
			currency,
		} } = this.props;
		const { cashbackInfoResponse: {
			cashback
		} } = this.state;

		return (
			<CurrencyNumber locale={locale} currency={currency} classList="font-weight-bold" money={Math.abs(cashback || 0)} />
		);
	}

	renderPhoneView() {
		const { onlineStoreInfo: {
			country,
		} } = this.props;
		const { isSavingPhone, redirectURL } = this.state;

		if (redirectURL) {
			return (
				<Link
					className="button__fill link__non-underline link__block border-radius-base font-weight-bold text-uppercase"
					to={redirectURL}
				>Check My Balance</Link>
			);
		}

		return (
			<PhoneView
				phone={Utils.getPhoneNumber()}
				country={country}
				setPhone={Utils.setPhoneNumber}
				submitPhoneNumber={this.cashbackAjax.bind(this, 'post')}
				isLoading={isSavingPhone}
				buttonText="Continue"
			/>
		);
	}

	render() {
		const { onlineStoreInfo: {
			country,
		} } = this.props;
		const { cashbackInfoResponse: {
			cashback
		}, redirectURL } = this.state;

		if (!country || !cashback) {
			return null;
		}

		return (
			<div className="thanks__phone-view">
				{
					redirectURL
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

export default withRouter(PhoneViewContainer);