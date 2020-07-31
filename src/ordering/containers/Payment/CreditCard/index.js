/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import qs from 'qs';
import { withTranslation } from 'react-i18next';
import Loader from '../components/Loader';
import Header from '../../../../components/Header';
import CurrencyNumber from '../../../components/CurrencyNumber';
import FormValidate from '../../../../utils/form-validate';
import RedirectForm from '../components/RedirectForm';
import CreateOrderButton from '../../../components/CreateOrderButton';
import Constants from '../../../../utils/constants';
import Utils from '../../../../utils/utils';
import config from '../../../../config';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as homeActionCreators } from '../../../redux/modules/home';
import { getCartSummary } from '../../../../redux/modules/entities/carts';
import { getOnlineStoreInfo, getBusiness, getMerchantCountry } from '../../../redux/modules/app';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { actions as paymentActionCreators, getCurrentOrderId } from '../../../redux/modules/payment';
import {
  getPaymentName,
  getSupportCreditCardBrands,
  creditCardDetector,
  getPaymentRedirectAndWebHookUrl,
} from '../utils';
import PaymentCardBrands from '../components/PaymentCardBrands';
import '../PaymentCreditCard.scss';
// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

class CreditCard extends Component {
  static propTypes = {};

  form = null;
  cardNumberEl = null;
  prevCardNumber = '';
  order = {};

  state = {
    payNowLoading: false,
    domLoaded: false,
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

    script.src = config.storehubPaymentScriptSrc;
    document.body.appendChild(script);

    this.setState({ domLoaded: true });

    const { homeActions } = this.props;

    homeActions.loadShoppingCart();
  }

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, business, merchantCountry } = this.props;
    const currentPayment = Constants.PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY;
    const { card } = this.state;
    const { cardholderName } = card || {};

    if (!onlineStoreInfo || !currentOrder || !currentPayment || !cardholderName || !window.encryptedCardData) {
      return null;
    }

    const { redirectURL, webhookURL } = getPaymentRedirectAndWebHookUrl(business);
    const { encryptedCardInfo, expYearCardInfo, expMonthCardInfo, maskedCardInfo } = window.encryptedCardData;

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      businessName: business,
      redirectURL,
      webhookURL,
      payActionWay: 1,
      paymentName: getPaymentName(merchantCountry, currentPayment),
      cardholderName,
      encryptedCardInfo,
      expYearCardInfo,
      expMonthCardInfo,
      maskedCardInfo,
    };
  };

  getCardInfoValidationOpts(id, inValidFixedlengthFiedls = []) {
    const { t, merchantCountry } = this.props;
    const { card } = this.state;

    const nameList = {
      cardNumber: 'number',
      validDate: 'expiration',
      cvv: 'security code',
    };
    const inValidNameList = [];

    inValidFixedlengthFiedls.forEach(item => {
      inValidNameList.push(nameList[item]);
    });

    let nameString = '';
    const verb = inValidNameList.length > 1 ? 'are' : 'is';

    inValidNameList.forEach((name, index) => {
      if (index) {
        nameString += index === inValidNameList.length - 1 ? ` and ${name}` : `, ${name}`;
      } else {
        nameString += name;
      }
    });

    let rules = {
      required: {
        message: t('RequiredMessage'),
      },
      fixedLength: {
        message: t('CardNumberIncompleteMessage', { nameString, verb }),
        length: card.ruler ? card.ruler.length + card.ruler.blocks.length - 1 : 19,
      },
      validCardNumber: {
        message: t('CardNumberInvalidMessage'),
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
    }

    return {
      rules,
      validCardNumber: () => {
        const supportCreditCardBrands = getSupportCreditCardBrands(merchantCountry);

        return supportCreditCardBrands.includes(card.brand);
      },
    };
  }

  getCardHolderNameValidationOpts() {
    const { t } = this.props;

    return {
      rules: {
        required: {
          message: t('RequiredMessage'),
        },
      },
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
      messages: {},
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
      invalidCardInfoFields,
    });

    return cardInfoResults.required;
  }

  validateForm() {
    const cardHolderNameOptions = this.getCardHolderNameValidationOpts();
    const holderNameResult = FormValidate.validate('cardholderName', cardHolderNameOptions);
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
        message: FormValidate.getErrorMessage('cardholderName', cardHolderNameOptions),
      });
    }

    this.setState({
      cardHolderNameError: newCardHolderNameError,
      cardInfoError: newCardInfoError,
      invalidCardInfoFields: Array.from([].concat(invalidCardInfoFields, this.validCardInfo() || [])),
    });
  }

  async handleBeforeCreateOrder() {
    await this.validateForm();

    const { t } = this.props;
    const { cardInfoError, cardHolderNameError } = this.state;

    if (cardHolderNameError.key || (cardInfoError.keys && cardInfoError.keys.length)) {
      return;
    }

    let isInvalidNum = null;
    let isExpired = null;
    let isInvalidCVV = null;

    window.My2c2p.getEncrypted('bank-2c2p-form', function(encryptedData, errCode) {
      if (!errCode) {
        window.encryptedCardData = encryptedData;
      } else {
        isInvalidNum = errCode === 2;
        isExpired = errCode === 7;
        isInvalidCVV = errCode === 10;
      }
    });

    if (isInvalidNum) {
      cardInfoError.keys.push('cardNumber');
      cardInfoError.messages.cardNumber = t('CardNumberInvalidMessage');

      this.setState({
        cardInfoError,
        invalidCardInfoFields: ['cardNumber'],
      });

      return;
    }

    if (isExpired) {
      cardInfoError.keys.push('validDate');
      cardInfoError.messages.validDate = t('CardExpirationInvalidMessage');

      this.setState({
        cardInfoError,
        invalidCardInfoFields: ['validDate'],
      });

      return;
    }

    if (isInvalidCVV) {
      cardInfoError.keys.push('cvv');
      cardInfoError.messages.cvv = t('CardCVVInvalidMessage');

      this.setState({
        cardInfoError,
        invalidCardInfoFields: ['cvv'],
      });

      return;
    }
  }

  handleChangeCardNumber(e) {
    let cursor = e.target.selectionStart;

    if (e.target.value.length % 5 === 1 && e.target.selectionStart === e.target.value.length - 1) {
      cursor += 1;
    }

    this.setState(
      {
        card: creditCardDetector(e.target.value),
      },
      () => {
        if (this.cardNumberEl !== null) {
          this.cardNumberEl.selectionEnd = cursor;
        }
      }
    );
  }

  handleChangeValidaDate(e) {
    const { validDate } = this.state;
    const isSpace = !validDate.replace(e.target.value, '').trim().length;

    this.setState({
      validDate: Utils.DateFormatter(e.target.value, e.target.value.length < validDate.length && isSpace),
    });
  }

  handleChangeCardHolderName(e) {
    const { card } = this.state;

    this.setState({
      card: {
        ...card,
        cardholderName: e.target.value,
      },
    });
  }

  renderCreditBrands() {
    const { card } = this.state;

    return (
      <div className="payment-credit-card__card-type-container flex flex-middle">
        <PaymentCardBrands
          iconClassName={'payment-bank__card-type-icon'}
          country={this.props.merchantCountry}
          brand={card.brand}
        />
      </div>
    );
  }

  renderForm() {
    const { t } = this.props;
    const { card, validDate, invalidCardInfoFields, cardInfoError, cardHolderNameError } = this.state;
    const { cardholderName } = card || {};
    const cardNumber = card.formattedCardNumber;

    return (
      <form id="bank-2c2p-form" className="form">
        <div className="padding-left-right-normal">
          <div className="flex flex-middle flex-space-between padding-top-bottom-normal">
            <label className="text-size-bigger text-weight-bolder">{t('CardInformation')}</label>
            {cardInfoError.keys.includes(FormValidate.errorNames.required) ? (
              <span className="form__error-message text-weight-bolder text-uppercase">
                {cardInfoError.messages.required}
              </span>
            ) : null}
          </div>
          <div className="payment-credit-card__card-container">
            <div
              className={`payment-credit-card__group-card-number padding-left-right-normal form__group ${
                invalidCardInfoFields.includes('cardNumber') ? 'error' : ''
              }`}
            >
              <input
                ref={ref => (this.cardNumberEl = ref)}
                id="cardNumber"
                className="payment-credit-card__input form__input text-size-biggest"
                data-heap-name="ordering.payment.credit-card.card-number"
                type="tel"
                placeholder="1234 1234 1234 1234"
                value={cardNumber || ''}
                onChange={this.handleChangeCardNumber.bind(this)}
                onBlur={this.validCardInfo.bind(this)}
              />
              {this.renderCreditBrands()}
            </div>
            <div className="flex flex-middle flex-space-between">
              <div className="payment-credit-card__group-left-bottom form__group padding-left-right-normal">
                <input
                  id="validDate"
                  className={`payment-credit-card__input form__input text-size-biggest ${
                    invalidCardInfoFields.includes('validDate') ? 'error' : ''
                  }`}
                  data-heap-name="ordering.payment.credit-card.valid-date"
                  type="tel"
                  placeholder="MM / YY"
                  value={validDate || ''}
                  onChange={this.handleChangeValidaDate.bind(this)}
                  onBlur={this.validCardInfo.bind(this)}
                />
              </div>

              <div className="payment-credit-card__group-right-bottom form__group padding-left-right-normal">
                <input
                  id="cvv"
                  data-encrypt="cvv"
                  className={`payment-credit-card__input form__input text-size-biggest ${
                    invalidCardInfoFields.includes('cvv') ? 'error' : ''
                  }`}
                  data-heap-name="ordering.payment.credit-card.cvv"
                  type="password"
                  placeholder="CVV"
                  onBlur={this.validCardInfo.bind(this)}
                />
              </div>
            </div>
          </div>
          {cardInfoError.keys.length
            ? cardInfoError.keys.map(key => {
                if (key === FormValidate.errorNames.required) {
                  return null;
                }

                return (
                  <span key={key} className="form__error-message padding-left-right-normal margin-top-bottom-smaller">
                    {cardInfoError.messages[key]}
                  </span>
                );
              })
            : null}
        </div>
        <div className="padding-normal">
          <div className="flex flex-middle flex-space-between padding-top-bottom-normal">
            <label className="text-size-bigger text-weight-bolder">{t('NameOnCard')}</label>
            {cardHolderNameError.key === FormValidate.errorNames.required ? (
              <span className="form__error-message text-weight-bolder text-uppercase">
                {cardHolderNameError.message}
              </span>
            ) : null}
          </div>
          <div className="payment-credit-card__group form__group">
            <input
              id="cardholderName"
              className={`payment-credit-card__input form__input padding-left-right-normal text-size-biggest ${
                cardHolderNameError.key === FormValidate.errorNames.required ? 'error' : ''
              }`}
              data-heap-name="ordering.payment.credit-card.holder-name"
              type="text"
              value={cardholderName || ''}
              onChange={this.handleChangeCardHolderName.bind(this)}
            />
          </div>
          {cardHolderNameError.key !== FormValidate.errorNames.required ? (
            <span className="form__error-message padding-left-right-normal margin-top-bottom-smaller">
              {cardHolderNameError.message}
            </span>
          ) : null}
        </div>

        <input type="hidden" data-encrypt="cardnumber" value={(cardNumber || '').replace(/[^\d]/g, '')}></input>
        <input type="hidden" data-encrypt="month" value={(validDate || '').substring(0, 2)}></input>
        <input type="hidden" data-encrypt="year" value={`20${(validDate || '').substring(5, 7)}`}></input>
        <input type="hidden" name="encryptedCardInfo" value=""></input>
      </form>
    );
  }

  render() {
    const { t, match, history, cartSummary, currentOrder } = this.props;
    const { payNowLoading, domLoaded } = this.state;
    const { orderId } = currentOrder || {};
    const { total } = cartSummary || {};
    const paymentData = this.getPaymentEntryRequestData();

    return (
      <section
        className={`payment-credit-card flex flex-column ${match.isExact ? '' : 'hide'}`}
        data-heap-name="ordering.payment.credit-card.container"
      >
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.payment.credit-card.header"
          isPage={true}
          title={t('PayViaCard')}
          navFunc={() => {
            history.replace({
              pathname: Constants.ROUTER_PATHS.ORDERING_PAYMENT,
              search: window.location.search,
            });
          }}
        />
        <div className="payment-credit-card__container padding-top-bottom-normal">
          <div className="text-center padding-top-bottom-normal">
            <CurrencyNumber className="text-size-large text-weight-bolder" money={total || 0} />
          </div>

          {this.renderForm()}
        </div>

        <footer className="payment-credit-card__footer footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <CreateOrderButton
            history={history}
            className="margin-top-bottom-smallest"
            data-test-id="payMoney"
            data-heap-name="ordering.payment.credit-card.pay-btn"
            disabled={payNowLoading}
            beforeCreateOrder={this.handleBeforeCreateOrder.bind(this)}
            afterCreateOrder={() => {
              this.setState({
                payNowLoading: !!orderId,
              });
            }}
          >
            {payNowLoading ? (
              <div className="loader"></div>
            ) : (
              <CurrencyNumber
                className="text-center text-weight-bolder text-uppercase"
                addonBefore={t('Pay')}
                money={total || 0}
              />
            )}
          </CreateOrderButton>
        </footer>

        {paymentData ? (
          <RedirectForm
            ref={ref => (this.form = ref)}
            action={config.storeHubPaymentEntryURL}
            method="POST"
            data={paymentData}
          />
        ) : null}

        <Loader loaded={domLoaded} />
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => {
      const currentOrderId = getCurrentOrderId(state);

      return {
        business: getBusiness(state),
        cartSummary: getCartSummary(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        merchantCountry: getMerchantCountry(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(CreditCard);
