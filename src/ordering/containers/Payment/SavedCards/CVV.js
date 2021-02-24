import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import _get from 'lodash/get';
import _toString from 'lodash/toString';
import _startsWith from 'lodash/startsWith';
import HybridHeader from '../../../../components/HybridHeader';
import Constants from '../../../../utils/constants';
import CreateOrderButton from '../../../components/CreateOrderButton';
import CurrencyNumber from '../../../components/CurrencyNumber';
import RedirectForm from '../components/RedirectForm';
import Loader from '../components/Loader';
import config from '../../../../config';
import Utils from '../../../../utils/utils';

import { bindActionCreators, compose } from 'redux';
import { getCartSummary } from '../../../../redux/modules/entities/carts';
import { actions as homeActionCreators } from '../../../redux/modules/home';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { getMerchantCountry } from '../../../redux/modules/app';
import { getBusinessInfo } from '../../../redux/modules/cart';
import { getPaymentRedirectAndWebHookUrl, getCardLabel } from '../utils';
import { getUser, getOnlineStoreInfo, getBusiness } from '../../../redux/modules/app';
import {
  actions as paymentActionCreators,
  getCardList,
  getCurrentOrderId,
  getSelectedPaymentCard,
} from '../../../redux/modules/payment';
import '../PaymentCreditCard.scss';
import './CVV.scss';

class CardCVV extends Component {
  state = {
    payNowLoading: false,
    isAdyenCardLoaded: false,
    isCvvValid: false,
    submitToPayment: false,
  };
  card = null;

  componentDidMount() {
    const { selectedPaymentCard, history } = this.props;

    if (!selectedPaymentCard || !selectedPaymentCard.cardToken) {
      history.replace({
        pathname: Constants.ROUTER_PATHS.ORDERING_ONLINE_SAVED_CARDS,
        search: window.location.search,
      });
      return;
    }

    this.initAdyenCard();
  }

  initAdyenCard = () => {
    const handleOnChange = (state, component) => {
      const { state: CardComponentState } = component;
      const isCvvValid = CardComponentState.valid.encryptedSecurityCode;
      if (this.state.isCvvValid !== isCvvValid) {
        this.setState({
          isCvvValid: isCvvValid,
        });
      }
    };

    const configuration = {
      environment: process.env.REACT_APP_ADYEN_PAYMENT_ENV, // Change this value to live env when go prod. Use test. When you're ready to accept live payments, change the value to one of our live environments.
      clientKey: process.env.REACT_APP_ADYEN_PAYMENT_CLIENTKEY,
      onChange: handleOnChange,
      translations: {
        'en-US': {
          'creditCard.cvcField.placeholder': 'CVC',
        },
      },
    };

    const checkout = new AdyenCheckout(configuration);

    this.card = checkout
      .create('card', {
        type: 'card',
        brands: ['mc', 'visa'],
        showPayButton: false,
        hasHolderName: false,
        showBrandIcon: true,
        styles: {
          base: {
            padding: '0',
            lineHeight: '54px',
            fontSmoothing: 'antialiased',
            fontSize: '1.25rem',
            outline: 'none',
            color: '#303030',
          },
          placeholder: {
            color: '#dededf',
          },
          validated: {
            outline: 'none',
          },
        },
        onError: error => {},
        onChange: handleOnChange,
        onFieldValid: () => {},
        onSubmit: (state, component) => {
          return false;
        },
        onValid: () => {},
        onLoad: () => {
          this.setState({
            isAdyenCardLoaded: true,
          });
        },
      })
      .mount('#adyen-cvv');
  };

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, business, businessInfo, user, selectedPaymentCard } = this.props;
    const currentPayment = Constants.PAYMENT_METHOD_LABELS.ADYEN_PAY;
    const { state, browserInfo } = this.card;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || !user || !state.data.encryptedSecurityCode) {
      return {};
    }

    const { redirectURL, webhookURL } = getPaymentRedirectAndWebHookUrl(business);
    const planId = _toString(_get(businessInfo, 'planId', ''));

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      redirectURL,
      webhookURL,
      userId: user.consumerId,
      cardToken: selectedPaymentCard.cardToken,
      paymentName: 'Adyen', // Check if can get from function
      encryptedSecurityCode: state.data.encryptedSecurityCode,
      type: Constants.ADYEN_PAYMENT_TYPE.PAY_WITH_SAVED_CARD,
      browserInfo,
      isInternal: _startsWith(planId, 'internal'),
      source: Utils.getOrderSource(),
    };
  };

  renderRedirectForm = () => {
    const { currentOrder } = this.props;

    if (!currentOrder) return null;
    if (!this.card || !this.state.isCvvValid || !this.state.submitToPayment) return null;

    const requestData = { ...this.getPaymentEntryRequestData() };
    const { receiptNumber } = requestData;

    return (
      receiptNumber && (
        <RedirectForm
          key="adyen-payment-redirect-form"
          action={config.storeHubPaymentEntryURL}
          method="POST"
          data={requestData}
        />
      )
    );
  };

  render() {
    const { t, history, cartSummary, selectedPaymentCard } = this.props;
    const { total } = cartSummary;
    const { isAdyenCardLoaded, payNowLoading } = this.state;

    if (!selectedPaymentCard || !selectedPaymentCard.cardInfo) return null;

    return (
      <section className="payment-credit-card flex flex-column">
        <HybridHeader
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage={true}
          title={t('PayViaCard')}
          navFunc={() => {
            history.replace({
              pathname: Constants.ROUTER_PATHS.ORDERING_ONLINE_SAVED_CARDS,
              search: window.location.search,
            });
          }}
        />
        <div
          className="payment-credit-card__container padding-top-bottom-normal"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: Utils.containerHeight({
              headerEls: [this.headerEl],
              footerEls: [this.footerEl],
            }),
          }}
        >
          <div className="padding-left-right-normal">
            <div>
              <h3 className="ordering-stores__title text-size-big text-weight-bolder margin-top-bottom-normal text-line-height-higher">
                {t('EnterCvcHint', {
                  label: getCardLabel(selectedPaymentCard.cardInfo.cardType),
                  maskNumber: selectedPaymentCard.cardInfo.maskedNumber,
                })}
              </h3>
              <p className="margin-top-bottom-normal text-line-height-base">{t('CvvConfirm')}</p>
            </div>
            <div id="adyen-cvv"></div>
          </div>
          <Loader className={'loading-cover opacity'} loaded={!isAdyenCardLoaded || !payNowLoading} />
        </div>
        <footer className="payment-credit-card__footer flex__shrink-fixed footer padding-top-bottom-small padding-left-right-normal">
          <CreateOrderButton
            className="margin-top-bottom-smaller"
            history={history}
            buttonType="submit"
            disabled={!this.state.isAdyenCardLoaded} // Disable this button until dom is ready
            beforeCreateOrder={() => {
              if (!this.state.isCvvValid) {
                // Trigger card submit to utilize adyen component verification
                this.card.submit();
                return;
              }

              this.setState({
                payNowLoading: true,
              });
            }}
            validCreateOrder={Boolean(this.card && this.state.isCvvValid)}
            afterCreateOrder={() => {
              this.setState({
                submitToPayment: true,
                payNowLoading: false,
              });
            }}
          >
            <CurrencyNumber
              className="text-center text-weight-bolder text-uppercase"
              addonBefore={t('Pay')}
              money={total || 0}
            />
          </CreateOrderButton>
        </footer>
        {this.renderRedirectForm()}
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
        merchantCountry: getMerchantCountry(state),
        cardList: getCardList(state),
        cartSummary: getCartSummary(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        selectedPaymentCard: getSelectedPaymentCard(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        user: getUser(state),
        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(CardCVV);
