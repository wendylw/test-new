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
		phone: null,
		isSavingPhone: false,
		redirectURL: null
	}

	componentWillMount() {
		this.handleCashbackAjax('get');
	}

	async handleCashbackAjax(method) {
		const { history } = this.props;
		const { phone } = this.state;
		const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
		let options = {
			url: `${Constants.api.CASHBACK}${method === 'get' ? `?receiptNumber=${receiptNumber}` : ''}`,
			method
		};

		if (method === 'post') {
			options = Object.assign({}, options, {
				data: {
					phone,
					receiptNumber,
					source: GlobalConstants.CASHBACK_SOURCE.QR_ORDERING
				}
			});
		}

		const { data } = await api(options);
		let redirectURL = null;

		if (method === 'get') {
			this.setState({
				cashbackInfoResponse: data
			});
		} else if (method === 'post') {
			const { customerId } = data;

			redirectURL = `${GlobalConstants.ROUTER_PATHS.CASHBACK_HOME}?customerId=${customerId}`;
			Utils.setPhoneNumber(phone);
		}

		this.setState({
			isSavingPhone: false,
			redirectURL,
		});
	}

	handleUpdatePhoneNumber(phone) {
		this.setState({ phone });
	}

	renderCurrencyNumber() {
		const {
			onlineStoreInfo: {
				locale,
				currency,
			}
		} = this.props;
		const {
			cashbackInfoResponse: {
				cashback,
			},
		} = this.state;

		if (!cashback) {
			return null;
		}

		return (
			<CurrencyNumber
				locale={locale}
				currency={currency}
				classList="font-weight-bold"
				money={Math.abs(cashback || 0)}
			/>
		);
	}

	renderPhoneView() {
		const {
			onlineStoreInfo: {
				country,
			},
		} = this.props;
		const {
			isSavingPhone,
			redirectURL,
			phone,
		} = this.state;

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
				phone={phone}
				country={country}
				setPhone={this.handleUpdatePhoneNumber.bind(this)}
				submitPhoneNumber={this.handleCashbackAjax.bind(this, 'post')}
				isLoading={isSavingPhone}
				buttonText="Continue"
			/>
		);
	}

	render() {
		const {
			onlineStoreInfo: {
				country,
			}
		} = this.props;
		const {
			cashbackInfoResponse: {
				cashback,
			},
			redirectURL,
		} = this.state;

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