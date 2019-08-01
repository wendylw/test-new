/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { compose, graphql, Query } from 'react-apollo';
import withOnlinstStoreInfo from '../libs/withOnlineStoreInfo';
import Utils from '../libs/utils';
import FormValidate from '../libs/form-validate';
import Constants from '../Constants';
import { client } from '../apiClient';
import apiGql from '../apiGql';
import config from '../config';
import RedirectForm from '../views/components/RedirectForm';
import CurrencyNumber from '../views/components/CurrencyNumber';
import DocumentTitle from '../views/components/DocumentTitle';

// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

class BankCardPayment extends Component {
	static propTypes = {
	}

	form = null;
	cardNumberEl = null;
	prevCardNumber = '';
	order = {};

	state = {
		payNowLoading: false,
		fire: false,
		cardNumberSelectionStart: 0,
		card: {},
		validDate: '',
		invalidCardInfoFields: [],
		cardInfoError: {
			keys: [],
			messages: [],
		},
		cardHolderNameError: {
			key: null,
			message: null,
		},
	};

	componentDidMount() {

		const script = document.createElement('script');

		script.src = 'https://demo2.2c2p.com/2C2PFrontEnd/SecurePayment/api/my2c2p.1.6.9.min.js';
		document.body.appendChild(script);
	}

	getQueryObject(paramName) {
		const { history } = this.props;

		if (!history.location.search) {
			return null;
		}

		const params = new URLSearchParams(history.location.search);

		return params.get(paramName);
	}

	getCardInfoValidationOpts(id, inValidFixedlengthFiedls = []) {
		const nameList = {
			cardNumber: 'number',
			validDate: 'expiration',
			cvv: 'security code'
		};
		const inValidNameList = [];

		inValidFixedlengthFiedls.forEach(item => {
			inValidNameList.push(nameList[item]);
		});

		let nameString = '';
		const verb = inValidNameList.length > 1 ? 'are' : 'is';

		inValidNameList.forEach((name, index) => {
			if (index) {
				nameString += ((index === inValidNameList.length - 1) ? ` and ${name}` : `, ${name}`);
			} else {
				nameString += name;
			}
		});

		let rules = {
			required: {
				message: 'Required'
			},
			fixedLength: {
				message: `Your card's ${nameString} ${verb} incomplete.`,
				length: 19,
			},
			validCardNumber: {
				message: 'Your card number isinvalid',
			},
		};

		switch (id) {
			case 'validDate':
				rules.fixedLength.length = 7;
				delete rules.validCardNumber;
				break;
			case 'cvv':
				delete rules.fixedLength;
				delete rules.validCardNumber;
				break;
			default:
				break;
		};

		return {
			rules,
			validCardNumber: () => {
				const { card } = this.state;

				return Boolean(card.type);
			},
		};
	}

	getCardHolderNameValidationOpts() {
		return {
			rules: {
				required: {
					message: 'Required'
				}
			}
		};
	}

	validCardInfo() {
		let cardInfoResults = {};
		const invalidCardInfoFields = ['cardNumber', 'validDate', 'cvv'].filter(id => {
			const cardInfoItemResult = FormValidate.validate(id, this.getCardInfoValidationOpts(id, []));

			if (!cardInfoItemResult.isValid) {
				if (Object.keys(cardInfoResults).includes(cardInfoItemResult.validateKey)) {
					cardInfoResults[cardInfoItemResult.validateKey].push(id);
				} else {
					cardInfoResults[cardInfoItemResult.validateKey] = [id];
				}

				return cardInfoItemResult.validateKey !== FormValidate.errorNames.required ? id : null;
			}

			return false;
		});
		const cardInfoError = {
			messages: {}
		};

		cardInfoError.keys = Object.keys(cardInfoResults).filter(key => {
			cardInfoResults[key].forEach(id => {
				cardInfoError.messages[key] = FormValidate.getErrorMessage(
					id,
					this.getCardInfoValidationOpts(id, cardInfoResults.fixedLength || [])
				);
			});

			if (key === FormValidate.errorNames.required) {
				return null;
			}

			return key;
		});

		this.setState({
			cardInfoError,
			invalidCardInfoFields
		});

		return cardInfoResults.required;
	}

	validateForm() {
		const cardHolderNameOptions = this.getCardHolderNameValidationOpts()
		const holderNameResult = FormValidate.validate('cardHolderName', cardHolderNameOptions);
		const { invalidCardInfoFields, cardInfoError } = this.state;
		let newCardHolderNameError = {
			key: null,
			message: null,
		};
		let newCardInfoError = cardInfoError;

		if (this.validCardInfo() && this.validCardInfo().length) {
			newCardInfoError.keys.push(FormValidate.errorNames.required);
			newCardInfoError.messages.required = this.getCardInfoValidationOpts().rules.required.message;
		}

		if (!holderNameResult.isValid) {
			Object.assign(newCardHolderNameError, {
				key: holderNameResult.validateKey,
				message: FormValidate.getErrorMessage('cardHolderName', cardHolderNameOptions),
			});
		}

		this.setState({
			cardHolderNameError: newCardHolderNameError,
			cardInfoError: newCardInfoError,
			invalidCardInfoFields: Array.from(
				[].concat(invalidCardInfoFields, this.validCardInfo() || [])
			),
		});
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

	handleChangeCardNumber(e) {
		let cursor = e.target.selectionStart;

		if (e.target.value.length % 5 === 1 && (e.target.selectionStart === e.target.value.length - 1)) {
			cursor += 1;
		}

		this.setState({
			card: Utils.creditCardDetector(e.target.value)
		}, () => {
			if (this.cardNumberEl !== null) {
				this.cardNumberEl.selectionEnd = cursor;
			}
		});
	}

	handleChangeValidaDate(e) {
		const { validDate } = this.state;
		const isSpace = !validDate.replace(e.target.value, '').trim().length;

		this.setState({
			validDate: Utils.DateFormatter(e.target.value, e.target.value.length < validDate.length && isSpace)
		});
	}

	handleChangeCardHolderName(e) {
		this.setState({
			cardholderName: e.target.value
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
			validDate,
			cardholderName,
			invalidCardInfoFields,
			cardInfoError,
			cardHolderNameError
		} = this.state;
		const cardNumber = card.formattedCardNumber;

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
									<CurrencyNumber classList="payment-bank__money font-weight-bold text-center" money={total || 0} />

									<form id="bank-2c2p-form" className="form">
										<div className="payment-bank__form-item">
											<div className="flex flex-middle flex-space-between">
												<label className="payment-bank__label font-weight-bold">Card information</label>
												{
													cardInfoError.keys.includes(FormValidate.errorNames.required)
														? <span className="error-message font-weight-bold text-uppercase">
															{cardInfoError.messages.required}
														</span>
														: null
												}
											</div>
											<div className="payment-bank__card-container">
												<div className={`input__list-top flex flex-middle flex-space-between ${invalidCardInfoFields.includes('cardNumber') ? 'has-error' : ''}`}>
													<input
														ref={ref => this.cardNumberEl = ref}
														id="cardNumber"
														className="input input__block"
														type="tel"
														placeholder="1234 1234 1234 1234"
														value={card.formattedCardNumber || ''}
														onChange={this.handleChangeCardNumber.bind(this)}
														onBlur={this.validCardInfo.bind(this)}
													/>
													<div className="payment-bank__card-type-container flex flex-middle">
														<i className={`payment-bank__card-type-icon visa text-middle ${card.type === 'visa' ? 'active' : ''}`}>
															<img src="/img/payment-visa.svg" />
														</i>
														<i className={`payment-bank__card-type-icon mastercard text-middle ${card.type === 'mastercard' ? 'active' : ''}`}>
															<img src="/img/payment-mastercard.svg" />
														</i>
													</div>
												</div>
												<div className="input__list-bottom flex flex-middle flex-space-between">
													<input
														id="validDate"
														className={`input input__block ${invalidCardInfoFields.includes('validDate') ? 'has-error' : ''}`}
														type="tel"
														placeholder="MM / YY"
														value={validDate || ''}
														onChange={this.handleChangeValidaDate.bind(this)}
														onBlur={this.validCardInfo.bind(this)}
													/>
													<input
														id="cvv"
														data-encrypt="cvv"
														className={`input input__block ${invalidCardInfoFields.includes('cvv') ? 'has-error' : ''}`}
														type="password"
														placeholder="CVV"
														onBlur={this.validCardInfo.bind(this)}
													/>
												</div>
											</div>
											<div className="error-message__container">
												{
													cardInfoError.keys.length
														? (cardInfoError.keys.map(key => {
															if (key === FormValidate.errorNames.required) {
																return null;
															}

															return <span key={key} className="error-message">{cardInfoError.messages[key]}</span>
														}))
														: null
												}
											</div>
										</div>
										<div className="payment-bank__form-item">
											<div className="flex flex-middle flex-space-between">
												<label className="payment-bank__label font-weight-bold">Name on card</label>
												{
													cardHolderNameError.key === FormValidate.errorNames.required
														?
														<span className="error-message font-weight-bold text-uppercase">
															{cardHolderNameError.message}
														</span>
														: null
												}
											</div>
											<input
												id="cardHolderName"
												className={`input input__block border-radius-base ${cardHolderNameError.key === FormValidate.errorNames.required ? 'has-error' : ''}`}
												type="text"
												value={cardholderName || ''}
												onChange={this.handleChangeCardHolderName.bind(this)}
											/>
											{
												cardHolderNameError.key !== FormValidate.errorNames.required
													? <span className="error-message">{cardHolderNameError.message}</span>
													: null
											}
										</div>

										<input type="hidden" data-encrypt="cardnumber" value={(cardNumber || '').replace(/[^\d]/g, '')}></input>
										<input type="hidden" data-encrypt="month" value={(validDate || '').substring(0, 2)}></input>
										<input type="hidden" data-encrypt="year" value={`20${(validDate || '').substring(5, 7)}`}></input>
										<input type="hidden" name="encryptedCardInfo" value=""></input>
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
					ref={ref => this.form = ref}
					action={config.storehubPaymentEntryURL}
					method="POST"
					fields={() => {
						const { onlineStoreInfo } = this.props;
						const { cardholderName } = this.state;
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
						fields.push({ name: 'paymentName', value: 'CCPP' });
						fields.push({ name: 'cardholderName', value: cardholderName });

						window.My2c2p.getEncrypted("bank-2c2p-form", function (encryptedData, errCode, errDesc) {
							if (!errCode) {
								window.encryptedCardInfo = encryptedData.encryptedCardInfo;
							} else {
								console.log(errDesc + "(" + errCode + ")");
							}
						});

						fields.push({ name: 'encryptedCardData', value: window.encryptedCardInfo });

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
)(BankCardPayment);
