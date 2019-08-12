/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { compose, graphql, Query } from 'react-apollo';
import withOnlinstStoreInfo from '../libs/withOnlineStoreInfo';
import Constants from '../Constants';
import api from '../cashback/utils/api';
import { client } from '../apiClient';
import apiGql from '../apiGql';
import config from '../config';
import RedirectForm from '../views/components/RedirectForm';
import CurrencyNumber from '../views/components/CurrencyNumber';
import DocumentTitle from '../views/components/DocumentTitle';

// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

const { PAYMENT_METHODS } = Constants;
const API_ONLINE_BANKING_LIST = '/payment/onlineBanking';

class OnlineBankingPayment extends Component {
	order = {};

	state = {
		agentCode: null,
		payNowLoading: false,
		fire: false,
		bankingList: [
			{
				"id": "1",
				"name": "Affin Bank",
				"agentCode": "FPX_ABB"
			},
			{
				"id": "2",
				"name": "Alliance Bank",
				"agentCode": "FPX_ABMB"
			},
			{
				"id": "3",
				"name": "AmBank",
				"agentCode": "FPX_AMB"
			},
			{
				"id": "4",
				"name": "Bank Islam",
				"agentCode": "FPX_BIMB"
			},
			{
				"id": "5",
				"name": "Bank Rakyat",
				"agentCode": "FPX_BKRM"
			},
			{
				"id": "6",
				"name": "Bank Muamalat",
				"agentCode": "FPX_BMMB"
			},
			{
				"id": "7",
				"name": "BSN",
				"agentCode": "FPX_BSN"
			},
			{
				"id": "8",
				"name": "CIMB Clicks",
				"agentCode": "FPX_CIMB"
			},
			{
				"id": "9",
				"name": "Hong Leong Bank",
				"agentCode": "FPX_HLB"
			},
			{
				"id": "10",
				"name": "HSBC Bank",
				"agentCode": "FPX_HSBC"
			},
			{
				"id": "11",
				"name": "KFH",
				"agentCode": "FPX_KFH"
			},
			{
				"id": "12",
				"name": "Maybank2U",
				"agentCode": "FPX_M2U"
			},
			{
				"id": "13",
				"name": "OCBC Bank",
				"agentCode": "FPX_OCBC"
			},
			{
				"id": "14",
				"name": "Public Bank",
				"agentCode": "FPX_PBB"
			},
			{
				"id": "15",
				"name": "RHB Bank",
				"agentCode": "FPX_RHB"
			},
			{
				"id": "16",
				"name": "Standard Chartered",
				"agentCode": "FPX_SCB"
			},
			{
				"id": "17",
				"name": "UOB Bank",
				"agentCode": "FPX_UOB"
			},
			{
				"id": "18",
				"name": "EPAY",
				"agentCode": "EPAY"
			}
		],
	};

	async componentWillMount() {
		const data = await api({
			url: API_ONLINE_BANKING_LIST,
			method: 'get',
		});
		const { bankingList } = data || {};

		if (!bankingList || !bankingList.length) {
			return;
		}

		this.setState({
			agentCode: bankingList[0].agentCode,
			bankingList
		});
	}

	getQueryObject(paramName) {
		const { history } = this.props;

		if (!history.location.search) {
			return null;
		}

		const params = new URLSearchParams(history.location.search);

		return params.get(paramName);
	}

	async payNow() {
		this.setState({
			payNowLoading: true,
			fire: true,
		});
	}

	renderMain() {
		const {
			match,
			history,
			onlineStoreInfo
		} = this.props;
		const {
			payNowLoading,
			fire,
			bankingList,
		} = this.state;

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

				<Query
					query={apiGql.GET_ORDER_DETAIL}
					client={client}
					variables={{ orderId: this.getQueryObject('orderId') }}
					onError={err => console.error('Can not get order detail from core-api\n', err)}
				>
					{({ data: { order = {} } = {} }) => {
						const { total } = order;

						this.order = order;

						return (
							<React.Fragment>
								<div className="payment-bank">
									<figure
										className="logo-default__image-container"
									>
										<img src={onlineStoreInfo.logo} alt="" />
									</figure>
									<CurrencyNumber classList="payment-bank__money font-weight-bold text-center" money={total || 0} />

									<form id="bank-2c2p-form" className="form">
										<div className="payment-bank__form-item">
											<div className="flex flex-middle flex-space-between">
												<label className="payment-bank__label font-weight-bold">Select a bank</label>
											</div>
											<div className="payment-bank__card-container">
												<div className="input">
													<select className="input__block">
														{
															bankingList.map((banking, key) => {
																return (
																	<option
																		key={`banking-${key}`}
																		value={banking.agentCode}
																		onClick={() => this.setState({ agentCode: banking.agentCode })}
																	>
																		{banking.name}
																	</option>
																);
															})
														}
													</select>
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
														<path d="M0 0h24v24H0z" fill="none" />
													</svg>
												</div>
											</div>
										</div>
									</form>
								</div>

								<div className="footer-operation">
									<button
										className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
										onClick={this.payNow.bind(this)}
										disabled={payNowLoading}
									>{
											payNowLoading
												? 'Redirecting'
												: <CurrencyNumber classList="font-weight-bold text-center" addonBefore="Pay" money={total || 0} />
										}
									</button>
								</div>
							</React.Fragment>
						);
					}}
				</Query>

				<RedirectForm
					action={config.storehubPaymentEntryURL}
					method="POST"
					fields={() => {
						const { agentCode } = this.state;
						const { total, orderId } = this.order;
						const fields = [];
						const h = config.h();
						const queryString = `?h=${encodeURIComponent(h)}`;

						if (!onlineStoreInfo || !this.order || !fire) {
							return null;
						}

						const redirectURL = `${config.storehubPaymentResponseURL.replace('{{business}}', config.business)}${queryString}`;
						const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('{{business}}', config.business)}${queryString}`;

						fields.push({ name: 'amount', value: total });
						fields.push({ name: 'currency', value: onlineStoreInfo.currency });
						fields.push({ name: 'receiptNumber', value: orderId });
						fields.push({ name: 'businessName', value: config.business });
						fields.push({ name: 'redirectURL', value: redirectURL });
						fields.push({ name: 'webhookURL', value: webhookURL });
						fields.push({ name: 'paymentName', value: PAYMENT_METHODS.ONLINE_BANKING_PAY });
						fields.push({ name: 'agentCode', value: agentCode });

						return fields;
					}}
					fire={fire}
				/>
			</section>
		)
	}

	render() {
		return (
			<DocumentTitle title={Constants.DOCUMENT_TITLE.CREDIT_CARD_PAYMENT}>
				{this.renderMain()}
			</DocumentTitle>
		);
	}
}


export default compose(
	withRouter,
	withOnlinstStoreInfo({
		props: ({ gqlOnlineStoreInfo: { loading, onlineStoreInfo } }) => {
			if (loading) {
				return null;
			}
			return { onlineStoreInfo };
		},
	}),
	graphql(apiGql.CREATE_ORDER, {
		name: 'createOrder',
	}),
)(OnlineBankingPayment);
