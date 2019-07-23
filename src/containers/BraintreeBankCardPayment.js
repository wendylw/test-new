/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { compose, graphql, Query } from 'react-apollo';
import withOnlinstStoreInfo from '../libs/withOnlineStoreInfo';
import withBraintreeToken from '../libs/withBraintreeToken';
import Constants from '../Constants';
import { client } from '../apiClient';
import apiGql from '../apiGql';
import config from '../config';
import RedirectForm from '../views/components/RedirectForm';
import CurrencyNumber from '../views/components/CurrencyNumber';
import DocumentTitle from '../views/components/DocumentTitle';

import '../Braintree.scss';

// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

const INVALID_CARDINFO_FIELDS = {
	number: 'number',
	expirationDate: 'expirationDate',
	cvv: 'cvv',
	cardHolderName: 'cardHolderName',
};
const BRAINTREE_STYLES = {
	'input': {
		'padding': '6px 12px',
		'margin': '20px',
		'border': '0',
		'color': '#303030',
		'font-size': '18px',
		'line-height': '1.5em',
		'height': '50px',
		'-webkit-appearance': 'none'
	},
	// Style the text of an invalid input
	'input.invalid': {
		'color': '#FF5821'
	},
	// placeholder styles need to be individually adjusted
	'::-webkit-input-placeholder': {
		'color': '#909090'
	},
	':-moz-placeholder': {
		'color': '#909090'
	},
	'::-moz-placeholder': {
		'color': '#909090'
	},
	':-ms-input-placeholder': {
		'color': '#909090'
	}
};
const BRAINTREE_FIELDS = {
	number: {
		selector: '#card-number',
		placeholder: '1234 1234 1234 1234'
	},
	expirationDate: {
		selector: '#expiration-date',
		placeholder: 'MM / YY'
	},
	cvv: {
		selector: '#cardCvv',
		placeholder: 'CVV'
	},
};

class BankCardPayment extends Component {
	static propTypes = {
	}

	form = null;
	submitButton = null;
	order = {};

	state = {
		payNowLoading: false,
		fire: false,
		card: {
			type: null,
			number: null,
			expirationDate: null,
			cvv: null,
			cardHolderName: null,
		},
		validDate: '',
		invalidCardInfoFields: [],
		nonce: null,
		errorTyoes: {
			required: [],
			invalidFields: []
		},
	};

	async componentDidMount() {
		const braintreeSources = {
			client: 'https://js.braintreegateway.com/web/3.47.0/js/client.min.js',
			hostedFields: 'https://js.braintreegateway.com/web/3.47.0/js/hosted-fields.min.js',
		};

		await Object.keys(braintreeSources).forEach(key => {
			const script = document.createElement('script');

			script.src = braintreeSources[key];
			document.body.appendChild(script);
		});

		this.initBraintreeToken(this.props.gqlBraintreeToken);
	}

	componentWillReceiveProps(nextProps) {
		const { gqlBraintreeToken } = nextProps;

		this.initBraintreeToken(gqlBraintreeToken);
	}

	initBraintreeToken(gqlBraintreeToken) {
		const { brainTree } = gqlBraintreeToken;

		if (brainTree && window.braintree && window.braintree.client && window.braintree.hostedFields) {
			this.braintreeSetting(brainTree.token || '');
		}
	}

	getQueryObject(paramName) {
		const { history } = this.props;

		if (!history.location.search) {
			return null;
		}

		const params = new URLSearchParams(history.location.search);

		return params.get(paramName);
	}

	getCardInfoInvalidMessage(type) {
		const fieldsName = {
			number: 'number',
			expirationDate: 'expiration date',
			cvv: 'CVV'
		};
		const { errorTyoes } = this.state;
		let nameString = '';
		let verb = '';
		let message = '';

		switch (type) {
			case 'required':
				message = 'Required';
				break;
			case 'invalidFields':
				if (errorTyoes.invalidFields.length > 2) {
					verb = 'are';
				} else {
					verb = 'is';
				}

				errorTyoes.invalidFields.forEach((f, index) => {
					if (index) {
						nameString += `${(index === errorTyoes.invalidFields.length - 1) ? ' and ' : ', '}`;
					}

					nameString += fieldsName[f];
				});

				message = `Your card's ${nameString} ${verb} invalid.`;
				break;
			default:
				break;
		}

		return message;
	}

	setCardInfoInvalidTypes(options, isReset) {
		const { errorTyoes } = this.state;
		const { type, field } = options;
		let newTypes = errorTyoes;

		if (isReset) {
			Object.keys(newTypes).forEach(t => {
				newTypes[t] = newTypes[t].filter(f => f !== field);
			});
		} else {
			if (!newTypes[type]) {
				newTypes.push(type);
			}

			if (!newTypes[type].includes(field)) {
				newTypes[type].push(field);
			}
		}

		this.setState({
			errorTyoes: newTypes,
		});
	}

	setCardInfoInvalidField(key, isReset) {
		const { invalidCardInfoFields } = this.state;
		let newFields = invalidCardInfoFields;

		if (!isReset && !invalidCardInfoFields.includes(INVALID_CARDINFO_FIELDS[key])) {
			newFields.push(INVALID_CARDINFO_FIELDS[key]);
		} else if (isReset) {
			newFields = newFields.filter(f => f !== INVALID_CARDINFO_FIELDS[key]);
		}

		this.setState({
			invalidCardInfoFields: newFields,
		});
	}

	setCardField(options) {
		const { card } = this.state;
		const { field, value } = options;
		let newCardFields = card;

		newCardFields[field] = value;

		this.setState({
			card: newCardFields
		});
	}

	checkFieldsEmpty() {
		const { card } = this.state;

		Object.keys(card).forEach(key => {
			if (!card[key]) {
				this.setCardInfoInvalidTypes({ type: 'required', field: key });
				this.setCardInfoInvalidField(key);
			} else if (card[key] === 'valid') {
				this.setCardInfoInvalidTypes({ field: key }, true);
				this.setCardInfoInvalidField(key, true);
			}
		});
	}

	braintreeSetting(brainTreeToken) {
		const that = this;
		const submitButtonEl = document.getElementById('submitButton');

		window.braintree.client.create({
			authorization: brainTreeToken,
		}, function (err, clientInstance) {
			if (err) {
				return;
			}

			// Create input fields and add text styles
			window.braintree.hostedFields.create({
				client: clientInstance,
				styles: BRAINTREE_STYLES,
				// Add information for individual fields
				fields: BRAINTREE_FIELDS,
			}, function (err, hostedFieldsInstance) {
				if (err) {
					console.error(err);
					return;
				}

				hostedFieldsInstance.on('blur', function (e) {
					const isReset = e.fields[e.emittedBy].isValid;

					if (!isReset) {
						hostedFieldsInstance.addClass(e.emittedBy, 'invalid');
					}
					that.setCardInfoInvalidTypes({ type: 'invalidFields', field: e.emittedBy }, isReset);
					that.setCardInfoInvalidField(e.emittedBy, isReset);
				});

				hostedFieldsInstance.on('validityChange', function (e) {
					const availableFields = Object.keys(INVALID_CARDINFO_FIELDS).filter(key => key !== INVALID_CARDINFO_FIELDS.cardHolderName);

					availableFields.forEach(key => {
						if (e.fields[key].isFocused) {
							const isReset = e.fields[key].isPotentiallyValid || e.fields[key].isValid;

							that.setCardInfoInvalidTypes({ type: 'invalidFields', field: key }, isReset);
							that.setCardInfoInvalidField(key, isReset);
						}

						let fieldValue = e.fields[key].isValid ? 'valid' : 'invalid';

						if (e.fields[key].isEmpty) {
							fieldValue = null;
						}

						that.setCardField({ field: key, value: fieldValue });
					});
				});

				hostedFieldsInstance.on('empty', function (e) {
					const focusingKey = Object.keys(e.fields).find(key => e.fields[key].isFocused);

					that.setCardInfoInvalidTypes({ field: focusingKey }, true);
					that.setCardInfoInvalidField(focusingKey, true);

					that.setCardField({ field: focusingKey, value: null });

					if (focusingKey === INVALID_CARDINFO_FIELDS.number) {
						that.setCardField({ field: 'type', value: null });
					}
				});

				hostedFieldsInstance.on('cardTypeChange', function (e) {
					let type = null;
					const validtionCardType = (e.cards || []).find(c => {
						return c.type === 'visa' || c.type === 'master-card'
					});

					const isReset = (e.fields.number.isPotentiallyValid || e.fields.number.isValid) && !!validtionCardType;

					if (!isReset) {
						hostedFieldsInstance.addClass(INVALID_CARDINFO_FIELDS.number, 'invalid');
					}

					if (validtionCardType && !e.fields.number.isEmpty) {
						type = validtionCardType.type;
					}

					that.setCardInfoInvalidTypes({ type: 'invalidFields', field: INVALID_CARDINFO_FIELDS.number }, isReset);
					that.setCardInfoInvalidField(INVALID_CARDINFO_FIELDS.number, isReset);
					that.setCardField({ field: 'type', value: type });
				});

				submitButtonEl.addEventListener('click', function (e) {
					e.preventDefault();

					hostedFieldsInstance.tokenize(function (err, payload) {
						that.checkFieldsEmpty();

						if (err) {
							console.error(err);
						} else {
							that.setState({
								nonce: payload.nonce,
								payNowLoading: true,
								fire: true,
							});
						}

					});
				}, false);
			});
		});
	}

	handleChangeCardHolderName(e) {
		const { card } = this.state;
		let newCard = card;

		this.setState({
			card: Object.assign({}, newCard, {
				cardHolderName: e.target.value
			}),
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
			card,
			invalidCardInfoFields,
			errorTyoes,
		} = this.state;

		return (
			<section className={`table-ordering__bank-payment ${match.isExact ? '' : 'hide'}`}>
				<header className="header border__botton-divider flex flex-middle flex-space-between">
					<figure className="header__image-container text-middle" onClick={() => {
						history.replace(Constants.ROUTER_PATHS.PAYMENT, history.location.state);
					}}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
					</figure>
					<h2 className="header__title font-weight-bold text-middle">Pay via Card</h2>
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
									<CurrencyNumber classList="payment-bank__money font-weight-bold text-center" money={total} />

									<form id="bank-2c2p-form" className="form">
										<div className="payment-bank__form-item">
											<div className="flex flex-middle flex-space-between">
												<label className="payment-bank__label font-weight-bold">Card information</label>
												{
													errorTyoes.required.filter(field => field !== INVALID_CARDINFO_FIELDS.cardHolderName).length
														? (<span className="error-message font-weight-bold text-uppercase">{this.getCardInfoInvalidMessage('required')}</span>)
														: null
												}
											</div>
											<div className="payment-bank__card-container">
												<div className={`input__list-top flex flex-middle flex-space-between ${invalidCardInfoFields.includes(INVALID_CARDINFO_FIELDS.number) ? 'has-error' : ''}`}>
													<div id="card-number"></div>
													<div className="payment-bank__card-type-container flex flex-middle">
														<i className={`payment-bank__card-type-icon visa text-middle ${card.type === 'visa' ? 'active' : ''}`}>
															<img src="/img/payment-visa.svg" />
														</i>
														<i className={`payment-bank__card-type-icon mastercard text-middle ${card.type === 'master-card' ? 'active' : ''}`}>
															<img src="/img/payment-mastercard.svg" />
														</i>
													</div>
												</div>
												<div className="input__list-bottom flex flex-middle flex-space-between">
													<div id="expiration-date" className={`${invalidCardInfoFields.includes(INVALID_CARDINFO_FIELDS.expirationDate) ? 'has-error' : ''}`}></div>
													<div id="cardCvv" className={`${invalidCardInfoFields.includes(INVALID_CARDINFO_FIELDS.cvv) ? 'has-error' : ''}`}></div>
												</div>
											</div>
											<div className="error-message__container">
												{
													errorTyoes.invalidFields.filter(field => field !== INVALID_CARDINFO_FIELDS.cardHolderName).length
														? (Object.keys(errorTyoes).map(key => {
															if (key === 'required') {
																return null;
															}

															return <span key={key} className="error-message">{this.getCardInfoInvalidMessage(key)}</span>
														}))
														: null
												}
											</div>
										</div>
										<div className="payment-bank__form-item">
											<div className="flex flex-middle flex-space-between">
												<label className="payment-bank__label font-weight-bold">Name on card</label>
												{
													errorTyoes.required.includes(INVALID_CARDINFO_FIELDS.cardHolderName)
														?
														<span className="error-message font-weight-bold text-uppercase">
															{this.getCardInfoInvalidMessage('required')}
														</span>
														: null
												}
											</div>
											<input
												id="cardHolderName"
												className={`input input__block border-radius-base ${invalidCardInfoFields.includes(INVALID_CARDINFO_FIELDS.cardHolderName) ? 'has-error' : ''}`}
												type="text"
												value={card.cardHolderName || ''}
												onChange={this.handleChangeCardHolderName.bind(this)}
											/>
										</div>
									</form>
								</div>

								<div className="footer-operation">
									<button
										ref={ref => this.submitButton = ref}
										id="submitButton"
										className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
										disabled={payNowLoading}
									>{
											payNowLoading
												? 'Redirecting'
												: <CurrencyNumber classList="font-weight-bold text-center" addonBefore="Pay" money={total} />
										}
									</button>
								</div>
							</React.Fragment>
						);
					}}
				</Query>

				<RedirectForm
					ref={ref => this.form = ref}
					action={config.storehubPaymentEntryURL}
					method="POST"
					fields={() => {
						const { onlineStoreInfo } = this.props;
						const { cardHolderName, nonce } = this.state;
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
						fields.push({ name: 'paymentName', value: Constants.PAYMENT_METHODS.CREDIT_CARD_PAY });
						fields.push({ name: 'cardholderName', value: cardHolderName });
						fields.push({ name: 'nonce', value: nonce });

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
	withBraintreeToken(),
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
)(BankCardPayment);
