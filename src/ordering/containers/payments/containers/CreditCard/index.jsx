/* eslint-disable jsx-a11y/alt-text */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import HybridHeader from '../../../../../components/HybridHeader';
import Loader from '../../components/Loader';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import FormValidate from '../../../../../utils/form-validate';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import Constants from '../../../../../utils/constants';
import Url from '../../../../../utils/url';
import Utils from '../../../../../utils/utils';
import config from '../../../../../config';

import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusiness,
  getMerchantCountry,
  getBusinessInfo,
} from '../../../../redux/modules/app';
import {
  getCleverTapAttributes,
  getSelectedPaymentOption,
  getTotal,
  getReceiptNumber,
  getInitPaymentRequestErrorMessage,
  getInitPaymentRequestErrorCategory,
  getIsInitPaymentRequestStatusRejected,
} from '../../redux/common/selectors';
import { initialize as initializeThunkCreator } from '../../redux/common/thunks';
import { getPaymentName, getSupportCreditCardBrands, creditCardDetector, getCreditCardDate } from '../../utils';
import PaymentCardBrands from '../../components/PaymentCardBrands';
import '../../styles/PaymentCreditCard.scss';
import prefetch from '../../../../../common/utils/prefetch-assets';
import CleverTap from '../../../../../utils/clevertap';
import * as ApiFetch from '../../../../../utils/api/api-fetch';
import logger from '../../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';
// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

class CreditCard extends Component {
  form = null;

  cardNumberEl = null;

  prevCardNumber = '';

  order = {};

  constructor(props) {
    super(props);
    this.state = {
      payNowLoading: false,
      hasScriptLoaded: false,
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
  }

  async componentDidMount() {
    const script = document.createElement('script');

    script.src = config.storehubPaymentScriptSrc;
    script.onload = this.loadScriptSucceedHandler;
    script.onerror = this.loadFailedHandler;
    document.body.appendChild(script);

    const { initialize } = this.props;

    await initialize(Constants.PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY);

    const { isInitPaymentFailed, initPaymentErrorMessage, initPaymentRequestErrorCategory } = this.props;

    if (isInitPaymentFailed) {
      logger.error(
        'Ordering_2C2PCreditCard_InitializeFailed',
        {
          message: initPaymentErrorMessage,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.CHECKOUT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].SELECT_PAYMENT_METHOD,
          },
          errorCategory: initPaymentRequestErrorCategory,
        }
      );
    }

    prefetch(['ORD_PMT'], ['OrderingPayment']);
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
      validDate: getCreditCardDate(e.target.value, e.target.value.length < validDate.length && isSpace),
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

  getPaymentEntryRequestData = () => {
    const { currentPaymentOption } = this.props;
    const { paymentProvider } = currentPaymentOption;
    const { card } = this.state;
    const { cardholderName } = card || {};

    // TODO: to read window.encryptedCardData actually make the function impure, which is bad practice, since this function
    // is called from render. We should move it to state.
    const { encryptedCardInfo } = window.encryptedCardData || {};

    return {
      payActionWay: 1,
      paymentProvider,
      cardholderName,
      encryptedCardInfo,
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

    const rules = {
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

  loadScriptSucceedHandler = () => {
    window.newrelic?.addPageAction('third-party-lib.load-script-succeeded', {
      scriptName: '2c2p',
    });
    this.setState({ hasScriptLoaded: true });
  };

  loadScriptFailedHandler = err => {
    delete window.Intercom;
    window.newrelic?.addPageAction('third-party-lib.load-script-failed', {
      scriptName: '2c2p',
      error: err?.message,
    });
    this.setState({ hasScriptLoaded: false });
  };

  isFromComplete = () => {
    const { cardInfoError, cardHolderNameError } = this.state;

    return !(cardHolderNameError.key || (cardInfoError.keys && cardInfoError.keys.length));
  };

  handleBeforeCreateOrder = async () => {
    this.setState({
      payNowLoading: true,
    });

    const { t, merchantCountry, total, cleverTapAttributes } = this.props;
    const { cardInfoError } = this.state;

    CleverTap.pushEvent('Card Details - click continue', {
      ...cleverTapAttributes,
      'payment method': getPaymentName(merchantCountry, Constants.PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY),
    });

    await this.validateForm();

    if (!this.isFromComplete()) {
      return;
    }

    let isInvalidNum = null;
    let isExpired = null;
    let isInvalidCVV = null;

    // check card risk
    const isRisky = await this.checkCardRisky();

    if (isRisky) {
      CleverTap.pushEvent('Card details - potential fraud card entry', {
        country: merchantCountry,
        'cart amount': total,
        save_card: false,
      });

      cardInfoError.keys.push('cardNumber');
      cardInfoError.messages.cardNumber = t('RiskyCardNumberMessage');

      this.setState({
        cardInfoError,
        invalidCardInfoFields: ['cardNumber'],
      });

      return;
    }

    window.My2c2p.getEncrypted('bank-2c2p-form', (encryptedData, errCode) => {
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
    }
  };

  handleAfterCreateOrder = orderId => {
    this.setState({
      payNowLoading: !!orderId,
    });

    if (!orderId) {
      logger.error(
        'Ordering_CreditCard_PayOrderFailed',
        {
          message: 'Failed to create order via 2C2P',
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.PAYMENT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.PAYMENT].SUBMIT_ORDER,
          },
        }
      );
      return;
    }

    logger.log('Ordering_Payment_OrderCreatedByCreditCard', { id: orderId });
  };

  checkCardRisky = async () => {
    try {
      const { card } = this.state;
      const { merchantCountry, total } = this.props;

      const result = await ApiFetch.get(Url.API_URLS.PAYMENT_RISK().url, {
        queryParams: {
          creditCardNum: card.cardNumber,
          countryCode: merchantCountry,
          amount: total,
        },
      });

      return result.isRisky;
    } catch (error) {
      console.error('Check card payment risk fail:', error?.message || '');
      // if failure, fallback to no risk
      return false;
    }
  };

  validCardInfo() {
    const cardInfoResults = {};
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
    const newCardHolderNameError = {
      key: null,
      message: null,
    };
    const newCardInfoError = cardInfoError;

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

  renderCreditBrands() {
    const { card } = this.state;
    const { merchantCountry } = this.props;

    return (
      <div className="payment-credit-card__card-type-container flex flex-middle">
        <PaymentCardBrands iconClassName="payment-bank__card-type-icon" country={merchantCountry} brand={card.brand} />
      </div>
    );
  }

  renderForm() {
    const { t, total } = this.props;
    const { card, validDate, invalidCardInfoFields, cardInfoError, cardHolderNameError } = this.state;
    const { cardholderName, cardNumber, formattedCardNumber } = card || {};

    return (
      <form id="bank-2c2p-form" className="form">
        <div className="text-center padding-top-bottom-normal">
          <CurrencyNumber className="text-size-large text-weight-bolder" money={total || 0} />
        </div>
        <div className="padding-left-right-normal">
          <div className="flex flex-middle flex-space-between padding-top-bottom-normal">
            <span className="text-size-bigger text-weight-bolder">{t('CardInformation')}</span>
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
                ref={ref => {
                  this.cardNumberEl = ref;
                }}
                id="cardNumber"
                className="payment-credit-card__input form__input text-size-biggest"
                data-test-id="ordering.payment.credit-card.card-number"
                type="tel"
                placeholder="1234 1234 1234 1234"
                value={formattedCardNumber || ''}
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
                  data-test-id="ordering.payment.credit-card.valid-date"
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
                  data-test-id="ordering.payment.credit-card.cvv"
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
                  <span
                    key={key}
                    className="form__error-message padding-left-right-normal margin-top-bottom-small text-line-height-higher"
                  >
                    {cardInfoError.messages[key]}
                  </span>
                );
              })
            : null}
        </div>
        <div className="padding-normal">
          <div className="flex flex-middle flex-space-between padding-top-bottom-normal">
            <span className="text-size-bigger text-weight-bolder">{t('NameOnCard')}</span>
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
              data-test-id="ordering.payment.credit-card.holder-name"
              type="text"
              value={cardholderName || ''}
              onChange={this.handleChangeCardHolderName.bind(this)}
            />
          </div>
          {cardHolderNameError.key !== FormValidate.errorNames.required ? (
            <span className="form__error-message padding-left-right-normal margin-top-bottom-small">
              {cardHolderNameError.message}
            </span>
          ) : null}
        </div>

        <input type="hidden" data-encrypt="cardnumber" value={cardNumber} />
        <input type="hidden" data-encrypt="month" value={(validDate || '').substring(0, 2)} />
        <input type="hidden" data-encrypt="year" value={`20${(validDate || '').substring(5, 7)}`} />
        <input type="hidden" name="encryptedCardInfo" value="" />
      </form>
    );
  }

  render() {
    const { t, match, history, total, merchantCountry, receiptNumber } = this.props;
    const { payNowLoading, hasScriptLoaded } = this.state;

    return (
      <section
        className={`payment-credit-card flex flex-column ${match.isExact ? '' : 'hide'}`}
        data-test-id="ordering.payment.credit-card.container"
      >
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-test-id="ordering.payment.credit-card.header"
          isPage
          title={t('PayViaCard')}
          navFunc={() => {
            CleverTap.pushEvent('Card Details - click back arrow');
            history.goBack();
          }}
        />
        <div
          style={{
            height: Utils.containerHeight({
              headerEls: [this.headerEl],
              footerEls: [this.footerEl],
            }),
          }}
          className="payment-credit-card__container padding-top-bottom-normal"
        >
          {this.renderForm()}
        </div>

        <footer
          ref={ref => {
            this.footerEl = ref;
          }}
          style={{ position: 'sticky' }}
          className="payment-credit-card__footer footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal"
        >
          <CreateOrderButton
            history={history}
            orderId={receiptNumber}
            total={total}
            className="margin-top-bottom-smaller text-uppercase"
            data-test-id="ordering.payment.credit-card.pay-btn"
            disabled={payNowLoading}
            beforeCreateOrder={this.handleBeforeCreateOrder}
            validCreateOrder={Boolean(this.isFromComplete())}
            afterCreateOrder={this.handleAfterCreateOrder}
            paymentName={getPaymentName(merchantCountry, Constants.PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY)}
            paymentExtraData={this.getPaymentEntryRequestData()}
            processing={payNowLoading}
            loaderText={t('Processing')}
          >
            {payNowLoading ? (
              t('Processing')
            ) : (
              <CurrencyNumber
                className="text-center text-weight-bolder text-uppercase"
                addonBefore={t('Pay')}
                money={total || 0}
              />
            )}
          </CreateOrderButton>
        </footer>
        <Loader className="loading-cover opacity" loaded={hasScriptLoaded} />
      </section>
    );
  }
}

CreditCard.displayName = 'CreditCard';

CreditCard.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  match: PropTypes.object,
  currentPaymentOption: PropTypes.object,
  cleverTapAttributes: PropTypes.object,
  /* eslint-enable */
  total: PropTypes.number,
  receiptNumber: PropTypes.string,
  merchantCountry: PropTypes.string,
  isInitPaymentFailed: PropTypes.bool,
  initPaymentErrorMessage: PropTypes.string,
  initPaymentRequestErrorCategory: PropTypes.string,
  initialize: PropTypes.func,
};

CreditCard.defaultProps = {
  total: 0,
  match: {},
  receiptNumber: null,
  merchantCountry: null,
  isInitPaymentFailed: false,
  cleverTapAttributes: {},
  currentPaymentOption: {},
  initPaymentErrorMessage: '',
  initPaymentRequestErrorCategory: '',
  initialize: () => {},
};

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => ({
      currentPaymentOption: getSelectedPaymentOption(state),
      business: getBusiness(state),
      businessInfo: getBusinessInfo(state),
      total: getTotal(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      merchantCountry: getMerchantCountry(state),
      cleverTapAttributes: getCleverTapAttributes(state),
      receiptNumber: getReceiptNumber(state),
      initPaymentErrorMessage: getInitPaymentRequestErrorMessage(state),
      initPaymentRequestErrorCategory: getInitPaymentRequestErrorCategory(state),
      isInitPaymentFailed: getIsInitPaymentRequestStatusRejected(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      initialize: bindActionCreators(initializeThunkCreator, dispatch),
    })
  )
)(CreditCard);
