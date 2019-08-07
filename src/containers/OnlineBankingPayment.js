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

const API_ONLINE_BANKING_LIST = '/online/ccpp/onlineBankingLists';

class OnlineBankingPayment extends Component {
	order = {};

	state = {
		payNowLoading: false,
		fire: false,
		bankingList: [],
	};

	async componentWillMount() {
		const data = await api({
			url: API_ONLINE_BANKING_LIST,
			method: 'get',
		});
		const { bankingList } = data || {};

		this.setState({ bankingList });
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
		this.validateForm();

		const {
			cardInfoError,
			cardHolderNameError
		} = this.state;

		if (cardHolderNameError.key || (cardInfoError.keys && cardInfoError.keys.length)) {
			return;
		}

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
												<span className="font-weight-bold text-uppercase">3m20s</span>
											</div>
											<div className="payment-bank__card-container">
												<select title="Select one">
													{
														bankingList.map(banking => {
															return (
																<option value={banking.agentCode}>{banking.name}</option>
															);
														})
													}
												</select>
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
						const { onlineStoreInfo } = this.props;
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
						fields.push({ name: 'paymentName', value: '' });
						fields.push({ name: 'agentCode', value: '' });

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
