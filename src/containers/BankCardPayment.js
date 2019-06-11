/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { compose, graphql, Query } from 'react-apollo';
import withOnlinstStoreInfo from '../libs/withOnlineStoreInfo';
import Utils from '../libs/utils';
import Constants from '../Constants';
import { client } from '../apiClient';
import apiGql from '../apiGql';
// import config from '../config';
// import RedirectForm from '../views/components/RedirectForm';
import CurrencyNumber from '../views/components/CurrencyNumber';
import DocumentTitle from '../views/components/DocumentTitle';

// Example URL: http://nike.storehub.local:3002/#/payment/bankcard
class BankCardPayment extends Component {
  static propTypes = {
  }

	form = null;
	cardNumberEl = null;
	prevCardNumber = '';

  state = {
    payNowLoading: false,
		fire: false,
		cardNumberSelectionStart: 0,
		card: {},
		validDate: ''
	};

  async payNow() {

    this.setState({
      payNowLoading: true,
    });

    try {
      // const { data } = await this.props.createOrder({
      //   variables: Object.assign({},{
      //     business: config.business,
      //     storeId: config.storeId,
      //     shoppingCartIds: shoppingCart.items.map(i => i.id),
      //     pax: Number(config.peopleCount),
      //   }, config.table ? {
      //     tableId: config.table
      //   } : {}),
      // });

      // if (data.createOrder) {
      //   // config.peopleCount = null; // clear peopleCount for next order
      //   this.setState({
      //     order: data.createOrder.orders[0],
      //     fire: true,
      //   });
      // }
    } catch (e) {
      console.error('Fail to create order\n', e);
      this.setState({
        payNowLoading: false,
      });
    }
	}

	getQueryObject(paramName) {
		const { history } = this.props;

		if(!history.location.search) {
			return null;
		}

		const params = new URLSearchParams(history.location.search);

		return params.get(paramName);
	}

	handleChangeCardNumber(e) {
		let cursor = e.target.selectionStart;

		if (e.target.value.length % 5 === 1 && (e.target.selectionStart === e.target.value.length - 1)) {
			cursor += 1;
		}

		this.setState({
			card: Utils.creditCardDetector(e.target.value)
		}, () => {
      if (this.cardNumberEl !== null){
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

  renderMain() {
		const { match, history, onlineStoreInfo } = this.props;
		const { payNowLoading, card, validDate } = this.state;

    return (
      <section className={`table-ordering__bank-payment ${match.isExact ? '' : 'hide'}`}>
        <header className="header border__botton-divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle" onClick={() => {
            history.replace(Constants.ROUTER_PATHS.PAYMENT, history.location.state);
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
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

						return (
							<React.Fragment>
								<div className="payment-bank">
									<figure
										className="logo-default__image-container"
									>
										<img src={onlineStoreInfo.logo} alt="" />
									</figure>
									<CurrencyNumber classList="payment-bank__money font-weight-bold text-center" money={total} />

									<form>
										<div className="payment-bank__form-item">
											<label className="payment-bank__label font-weight-bold">Card information</label>
											<div className="payment-bank__card-container">
												<div className="input__list-top flex flex-middle flex-space-between">
													<input
														ref={ref => this.cardNumberEl = ref}
														className="input input__block"
														type="tel"
														placeholder="1234 1234 1234 1234"
														onChange={this.handleChangeCardNumber.bind(this)}
														value={card.formattedCardNumber || ''}
														onFocus={this.inputOnFocus }
													/>
													<div className="payment-bank__card-type-container flex flex-middle">
														<i className={`payment-bank__card-type-icon visa text-middle ${card.type === 'visa' ? 'active' : ''}`}>
															<img src="/img/payment-visa.svg"/>
														</i>
														<i className={`payment-bank__card-type-icon mastercard text-middle ${card.type === 'mastercard' ? 'active' : ''}`}>
															<img src="/img/payment-mastercard.svg"/>
														</i>
													</div>
												</div>
												<div className="input__list-bottom flex flex-middle flex-space-between">
													<input
														className="input input__block"
														type="tel"
														placeholder="MM / YY"
														onChange={this.handleChangeValidaDate.bind(this)}
														value={validDate || ''}
													/>
													<input className="input input__block" type="password" placeholder="CVV" />
												</div>
											</div>
										</div>
										<div className="payment-bank__form-item">
											<label className="payment-bank__label font-weight-bold">Name on card</label>
											<div>
												<input className="input input__block border-radius-base" type="text" />
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
											: <CurrencyNumber classList="font-weight-bold text-center" addonBefore="Pay" money={total} />
										}
									</button>
								</div>
							</React.Fragment>
						);
					}}
				</Query>

        {/* <RedirectForm
          ref={ref => this.form = ref}
          action={config.storehubPaymentEntryURL}
          method="POST"
          fields={() => {
            const { onlineStoreInfo } = this.props;
            const { order } = this.state;
            const fields = [];
            const h = config.h();
            const queryString = `?h=${encodeURIComponent(h)}`;

            if (!onlineStoreInfo || !order) {
              return null;
            }

            const redirectURL = `${config.storehubPaymentResponseURL.replace('{{business}}', config.business)}${queryString}`;
            const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('{{business}}', config.business)}${queryString}`;

            fields.push({ name: 'amount', value: order.total });
            fields.push({ name: 'currency', value: onlineStoreInfo.currency });
            fields.push({ name: 'receiptNumber', value: order.orderId });
            fields.push({ name: 'businessName', value: config.business });
            fields.push({ name: 'redirectURL', value: redirectURL });
            fields.push({ name: 'webhookURL', value: webhookURL });

            return fields;
          }}
          fire={this.state.fire}
        /> */}
      </section>
    )
  }

  render() {
    return (
      <DocumentTitle title={Constants.DOCUMENT_TITLE.BANK_CARD_PAYMENT}>
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
