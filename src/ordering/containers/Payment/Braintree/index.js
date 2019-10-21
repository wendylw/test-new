/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import Loader from '../components/Loader';
import Header from '../../../../components/Header';
import RedirectForm from '../components/RedirectForm';
import CurrencyNumber from '../../../components/CurrencyNumber';
import Constants from '../../../../utils/constants';
import Utils from '../../../../utils/utils';
import config from '../../../../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo, getBusiness } from '../../../redux/modules/app';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { actions as paymentActions, getCurrentPayment, getCurrentOrderId, getBraintreeToken } from '../../../redux/modules/payment';

import './Braintree.scss';

// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

const VALID_CARDTYPES = {
  VISA: 'visa',
  MASTER_CARD: 'master-card',
};
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

class Braintree extends Component {
  form = null;
  order = {};

  state = {
    payNowLoading: false,
    brainTreeDOMLoaded: false,
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
    errorTypes: {
      required: [],
      invalidFields: []
    },
  };

  getPaymentEntryRequestData = () => {
    const {
      onlineStoreInfo,
      currentOrder,
      currentPayment,
      business,
    } = this.props;
    const {
      card,
      nonce,
    } = this.state;
    const {
      cardHolderName
    } = card || {};
    const h = config.h();
    const queryString = `?h=${encodeURIComponent(h)}`;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || !cardHolderName || !nonce) {
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
      cardHolderName,
      nonce,
    };
  }

  componentWillMount() {
    const {
      history,
      paymentActions,
    } = this.props;

    paymentActions.fetchBraintreeToken(Constants.PAYMENT_METHODS.CREDIT_CARD_PAY);
    paymentActions.fetchOrder(Utils.getQueryObject(history, 'orderId'));
  }

  componentDidMount() {
    const braintreeSources = {
      client: 'https://js.braintreegateway.com/web/3.47.0/js/client.min.js',
      hostedFields: 'https://js.braintreegateway.com/web/3.47.0/js/hosted-fields.min.js',
    };

    Object.keys(braintreeSources).forEach(key => {
      const script = document.createElement('script');
      const { token } = this.props;

      script.src = braintreeSources[key];

      script.onload = () => {
        this.braintreeSetting(token);
      }

      document.body.appendChild(script);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { token } = nextProps;

    if (token && !this.props.token) {
      this.braintreeSetting(token);
    }
  }

  componentWillUnmount() {
    const { paymentActions } = this.props;

    paymentActions.clearBraintreeToken();
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
    const { errorTypes } = this.state;
    let nameString = '';
    let verb = '';
    let message = '';

    switch (type) {
      case 'required':
        message = 'Required';
        break;
      case 'invalidFields':
        if (errorTypes.invalidFields.length > 2) {
          verb = 'are';
        } else {
          verb = 'is';
        }

        errorTypes.invalidFields.forEach((f, index) => {
          if (index) {
            nameString += `${(index === errorTypes.invalidFields.length - 1) ? ' and ' : ', '}`;
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
    const { errorTypes } = this.state;
    const { type, field } = options;
    let newTypes = errorTypes;

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
      errorTypes: newTypes,
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
      } else if (card[key] === 'valid' || Object.values(VALID_CARDTYPES).includes(card[key])) {
        this.setCardInfoInvalidTypes({ field: key }, true);
        this.setCardInfoInvalidField(key, true);
      }
    });
  }

  braintreeSetting(token) {
    const that = this;
    const submitButtonEl = document.getElementById('submitButton');

    if (!window.braintree || !window.braintree.client || !window.braintree.hostedFields || !token) {
      return;
    }

    window.braintree.client.create({
      authorization: token || null,
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
          return;
        }

        that.setState({
          brainTreeDOMLoaded: true
        });

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
            return Object.values(VALID_CARDTYPES).includes(c.type);
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

          that.setState({ payNowLoading: true });

          hostedFieldsInstance.tokenize(function (err, payload) {
            that.checkFieldsEmpty();
            const { card } = that.state;

            if (err) {
              that.setState({ payNowLoading: false });
            } else {
              that.setState({
                nonce: payload.nonce,
                payNowLoading: Boolean(card.cardHolderName),
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
    let invalidTypeOptions = { field: INVALID_CARDINFO_FIELDS.cardHolderName };

    if (!Boolean(e.target.value)) {
      invalidTypeOptions = Object.assign({},
        invalidTypeOptions,
        { type: 'required' }
      );
    }

    this.setCardInfoInvalidTypes(invalidTypeOptions, Boolean(e.target.value));
    this.setCardInfoInvalidField(INVALID_CARDINFO_FIELDS.cardHolderName, Boolean(e.target.value));

    this.setState({
      card: Object.assign({}, newCard, {
        cardHolderName: e.target.value
      }),
    });
  }

  handleSubmitForm(e) {
    e.preventDefault();

    const event = document.createEvent('HTMLEvents');
    const submitButtonEl = document.getElementById('submitButton');

    event.initEvent('click', true, false);
    submitButtonEl.dispatchEvent(event);
  }

  renderForm() {
    const {
      card,
      invalidCardInfoFields,
      brainTreeDOMLoaded,
      errorTypes,
    } = this.state;

    return (
      <form id="bank-2c2p-form" className="form" onSubmit={this.handleSubmitForm.bind(this)}>
        <div className="payment-bank__form-item">
          <div className="flex flex-middle flex-space-between">
            <label className="payment-bank__label font-weight-bold">Card information</label>
            {
              errorTypes.required.filter(field => field !== INVALID_CARDINFO_FIELDS.cardHolderName).length
                ? (<span className="error-message font-weight-bold text-uppercase">{this.getCardInfoInvalidMessage('required')}</span>)
                : null
            }
          </div>
          <div className={`payment-bank__card-container ${brainTreeDOMLoaded ? 'loaded' : ''}`}>
            <div className={`input__list-top flex flex-middle flex-space-between ${invalidCardInfoFields.includes(INVALID_CARDINFO_FIELDS.number) ? 'has-error' : ''}`}>
              <div id="card-number" className="card-info__wrapper"></div>
              <div className="payment-bank__card-type-container flex flex-middle">
                <i className={`payment-bank__card-type-icon visa text-middle ${card.type === VALID_CARDTYPES.VISA ? 'active' : ''}`}>
                  <img src="/img/payment-visa.svg" />
                </i>
                <i className={`payment-bank__card-type-icon mastercard text-middle ${card.type === VALID_CARDTYPES.MASTER_CARD ? 'active' : ''}`}>
                  <img src="/img/payment-mastercard.svg" />
                </i>
              </div>
            </div>
            <div className="input__list-bottom flex flex-middle flex-space-between">
              <div id="expiration-date" className={`card-info__wrapper ${invalidCardInfoFields.includes(INVALID_CARDINFO_FIELDS.expirationDate) ? 'has-error' : ''}`}></div>
              <div id="cardCvv" className={`card-info__wrapper ${invalidCardInfoFields.includes(INVALID_CARDINFO_FIELDS.cvv) ? 'has-error' : ''}`}></div>
            </div>
          </div>
          <div className="error-message__container">
            {
              errorTypes.invalidFields.filter(field => field !== INVALID_CARDINFO_FIELDS.cardHolderName).length
                ? (Object.keys(errorTypes).map(key => {
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
              errorTypes.required.includes(INVALID_CARDINFO_FIELDS.cardHolderName)
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
    );
  }

  render() {
    const {
      match,
      history,
      onlineStoreInfo,
      currentOrder,
    } = this.props;
    const { logo } = onlineStoreInfo || {};
    const {
      payNowLoading,
      brainTreeDOMLoaded,
    } = this.state;
    const { total } = currentOrder || {};
    const paymentData = this.getPaymentEntryRequestData();

    return (
      <section className={`table-ordering__bank-payment ${match.isExact ? '' : 'hide'}`}>
        <Header
          className="border__bottom-divider gray has-right"
          isPage={true}
          title="Pay via Card"
          navFunc={() => {
            history.replace(Constants.ROUTER_PATHS.ORDERING_PAYMENT, history.location.state);
          }}
        />

        <div className="payment-bank">
          <figure
            className="logo-default__image-container"
          >
            <img src={logo} alt="" />
          </figure>
          <CurrencyNumber
            className="payment-bank__money font-weight-bold text-center"
            money={total}
          />

          {this.renderForm()}
        </div>

        <div className="footer-operation">
          <button
            id="submitButton"
            className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
            disabled={payNowLoading || !brainTreeDOMLoaded}
          >{
              payNowLoading
                ? <div className="loader"></div>
                : (
                  <CurrencyNumber
                    className="font-weight-bold text-center"
                    addonBefore="Pay"
                    money={total}
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
                action={config.storeHubPaymentEntryURL}
                method="POST"
                data={paymentData}
              />
            )
            : null
        }

        <Loader loaded={brainTreeDOMLoaded} />
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
)(Braintree);
