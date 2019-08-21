/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import Loader from './components/Loader';
import RedirectForm from './components/RedirectForm';
import CurrencyNumber from '../../components/CurrencyNumber';
import Constants from '../../../utils/constants';
import config from '../../../config';


import api from '../cashback/utils/api';
import { client } from '../apiClient';
import apiGql from '../apiGql';
import config from '../config';
import RedirectForm from '../views/components/RedirectForm';

// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

const { PAYMENT_METHODS } = Constants;
const API_ONLINE_BANKING_LIST = '/payment/onlineBanking';

class OnlineBankingPayment extends Component {
	order = {};

	state = {
		agentCode: null,
		payNowLoading: false,
		fire: false,
		loadedBankingList: false,
		bankingList: [],
	};

	getPaymentEntryRequestData = () => {
		const {
			onlineStoreInfo,
			currentOrder,
			currentPayment,
			business,
		} = this.props;
		const { agentCode } = this.state;
		const h = config.h();
		const queryString = `?h=${encodeURIComponent(h)}`;

		if (!onlineStoreInfo || !currentOrder || !currentPayment || !agentCode) {
			return null;
		}

		const redirectURL = `${config.storehubPaymentResponseURL.replace('{{business}}', business)}${queryString}`;
		const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('{{business}}', business)}${queryString}`;

		return {
			amount: currentOrder.total,
			currency: onlineStoreInfo.currency,
			receiptNumber: currentOrder.orderId,
			businessName: business,
			redirectURL: redirectURL,
			webhookURL: webhookURL,
			paymentName: currentPayment,
			agentCode,
		};
	}

	async componentWillMount() {
		const data = await api({
			url: API_ONLINE_BANKING_LIST,
			method: 'get',
		});
		const { bankingList } = data || {};
		let newStates = {
			loadedBankingList: true,
		};

		if (bankingList && bankingList.length) {
			newStates = Object.assign({}, newStates, {
				agentCode: bankingList[0].agentCode,
				bankingList: bankingList
			});
		}

		this.setState(newStates);
	}

	async payNow() {
		const { agentCode } = this.state;
		let payState = {
			payNowLoading: true
		};

		if (agentCode) {
			payState = {
				fire: true,
			};
		}

		this.setState(payState);
	}

	handleSelectBank(e) {
		this.setState({
			agentCode: e.target.value,
		});
	}

	renderBankingList() {
		const { bankingList } = this.state;

		if (!bankingList || !bankingList.length) {
			return (
				<select className="input__block" disabled>
					<option>Select one</option>
				</select>
			);
		}

		return (
			<select className="input__block" onChange={this.handleSelectBank.bind(this)}>
				{
					bankingList.map((banking, key) => {
						return (
							<option
								key={`banking-${key}`}
								value={banking.agentCode}
							>
								{banking.name}
							</option>
						);
					})
				}
			</select>
		);
	}

	render() {
		const {
			match,
			history,
			onlineStoreInfo
		} = this.props;
		const { logo } = onlineStoreInfo || {};
		const {
			agentCode,
			payNowLoading,
			loadedBankingList,
			fire,
		} = this.state;
		const paymentData = this.getPaymentEntryRequestData();


		return (
			<section className={`table-ordering__bank-payment ${match.isExact ? '' : 'hide'}`}>
				<header className="header border__botton-divider flex flex-middle flex-space-between">
					<figure className="header__image-container text-middle" onClick={() => {
						history.replace(Constants.ROUTER_PATHS.PAYMENT, history.location.state);
					}}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
					</figure>
					<h2 className="header__title font-weight-bold text-middle">Pay via Online Banking</h2>
				</header>

				<div className="payment-bank">
					<figure
						className="logo-default__image-container"
					>
						<img src={logo} alt="" />
					</figure>
					<CurrencyNumber
						className="payment-bank__money font-weight-bold text-center"
						money={total || 0}
					/>

					<form id="bank-2c2p-form" className="form">
						<div className="payment-bank__form-item">
							<div className="flex flex-middle flex-space-between">
								<label className="payment-bank__label font-weight-bold">Select a bank</label>
							</div>
							<div className="payment-bank__card-container">
								<div className={`input ${payNowLoading && !agentCode ? 'has-error' : ''}`}>
									{this.renderBankingList()}
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
										<path d="M0 0h24v24H0z" fill="none" />
									</svg>
								</div>
								{
									payNowLoading && !agentCode
										? (
											<div className="error-message__container">
												<span className="error-message">Please select a bank to continue</span>
											</div>
										)
										: null
								}
							</div>
						</div>
					</form>
				</div>

				<div className="footer-operation">
					<button
						className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
						onClick={this.payNow.bind(this)}
						disabled={payNowLoading && agentCode}
					>{
							payNowLoading && !agentCode
								? 'Redirecting'
								: (
									<CurrencyNumber
										classList="font-weight-bold text-center"
										addonBefore="Pay"
										money={total || 0}
									/>
								)
						}
					</button>
				</div>

				{
					paymentData
						? (
							<RedirectForm
								ref={ref => this.form = ref}
								action={config.storehubPaymentEntryURL}
								method="POST"
								data={paymentData}
							/>
						)
						: null
				}

				<Loader loaded={loadedBankingList} />
			</section>
		);
	}
}

export default connect(
	state => {
		const currentOrderId = getCurrentOrderId(state);

		return {
			token: getBraintreeToken(state),
			business: getBusiness(state),
			currentPayment: getCurrentPayment(state),
			onlineStoreInfo: getOnlineStoreInfo(state),
			currentOrder: getOrderByOrderId(state, currentOrderId),
		};
	},
	dispatch => ({
		paymentActions: bindActionCreators(paymentActions, dispatch),
	}),
)(OnlineBankingPayment);
