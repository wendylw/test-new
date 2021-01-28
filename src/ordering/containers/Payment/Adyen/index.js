import React, { Component } from 'react';
import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import _toString from 'lodash/toString';
import _startsWith from 'lodash/startsWith';
import Loader from '../components/Loader';
import HybridHeader from '../../../../components/HybridHeader';
import Constants from '../../../../utils/constants';
import CurrencyNumber from '../../../components/CurrencyNumber';
import CreateOrderButton from '../../../components/CreateOrderButton';
import RedirectForm from '../components/RedirectForm';
import config from '../../../../config';
import SwitchButton from '../../../../../src/components/SwitchButton';
import Utils from '../../../../utils/utils';

import { bindActionCreators, compose } from 'redux';
import { getCartSummary } from '../../../../redux/modules/entities/carts';
import { actions as homeActionCreators } from '../../../redux/modules/home';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { getOnlineStoreInfo, getBusiness, getMerchantCountry, getUser } from '../../../redux/modules/app';
import { actions as paymentActionCreators, getCurrentOrderId } from '../../../redux/modules/payment';
import { getBusinessInfo } from '../../../redux/modules/cart';
import { getPaymentName, getPaymentRedirectAndWebHookUrl } from '../utils';
import AdyenSecurity from '../../../../../src/images/Adyen-PCI.png';
import '../PaymentCreditCard.scss';
import './AdyenPage.scss';

class AdyenPage extends Component {
  state = {
    isAdyenCardLoaded: false,
    isCardValid: false,
    submitToPayment: false,
    saveCard: true,
  };
  card = null;

  componentDidMount() {
    this.props.homeActions.loadShoppingCart();

    this.initAdyenCard();
  }

  initAdyenCard = () => {
    const handleOnChange = (state, component) => {
      const { isValid } = state;
      if (this.state.isCardValid !== isValid || isValid) {
        this.setState({
          isCardValid: isValid,
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
          'creditCard.numberField.placeholder': '1234 1234 1234 1234',
          'creditCard.holderName.placeholder': '',
        },
      },
    };

    const checkout = new AdyenCheckout(configuration);

    this.card = checkout
      .create('card', {
        type: 'card',
        brands: ['mc', 'visa'],
        showPayButton: false,
        hasHolderName: true,
        holderNameRequired: true,
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
      .mount('#adyen-container');
  };

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, business, businessInfo, merchantCountry, user } = this.props;
    const currentPayment = Constants.PAYMENT_METHOD_LABELS.ADYEN_PAY;
    const { state, browserInfo } = this.card;
    const { data: paymentMethod } = state;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || !paymentMethod || !user) {
      return {};
    }

    const { redirectURL, webhookURL } = getPaymentRedirectAndWebHookUrl(business);
    const { saveCard } = this.state;
    const planId = _toString(_get(businessInfo, 'planId', ''));

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      businessName: business,
      paymentName: getPaymentName(merchantCountry, currentPayment),
      browserInfo: JSON.stringify(browserInfo || {}),
      redirectURL,
      webhookURL,
      userId: user.consumerId,
      isInternal: _startsWith(planId, 'internal'),
      orderSource: Utils.getOrderSource(),
      ...paymentMethod,
      type: saveCard
        ? Constants.ADYEN_PAYMENT_TYPE.PAY_WITH_SAVE_CARD
        : Constants.ADYEN_PAYMENT_TYPE.PAY_WITHOUT_SAVE_CARD,
    };
  };

  renderRedirectForm = () => {
    const { currentOrder } = this.props;

    if (!currentOrder) return null;
    if (!this.card || !this.state.isCardValid || !this.state.submitToPayment) return null;

    const requestData = { ...this.getPaymentEntryRequestData() };
    const { receiptNumber, browserInfo } = requestData;

    return receiptNumber && browserInfo ? (
      <RedirectForm
        key="adyen-payment-redirect-form"
        action={config.storeHubPaymentEntryURL}
        method="POST"
        data={requestData}
      />
    ) : null;
  };

  handleSubmit = e => {
    e.preventDefault();

    return;
  };

  render() {
    const { t, history, cartSummary } = this.props;
    const { total } = cartSummary;

    return (
      <section className={`ordering-payment flex flex-column`} data-heap-name="ordering.payment.adyen.container">
        <HybridHeader
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.payment.adyen.header"
          isPage={true}
          title={t('PayViaCard')}
          navFunc={() => {
            history.goBack();
          }}
        />

        <div
          className="ordering-payment__container padding-top-bottom-normal"
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
          <div className="text-center padding-top-bottom-normal">
            <CurrencyNumber className="text-size-large text-weight-bolder" money={total || 0} />
          </div>

          {/* Start of card form */}
          <form className="form" onSubmit={this.handleSubmit}>
            <div className="padding-left-right-normal payment-credit-card__content">
              <div className="flex flex-middle flex-space-between padding-top-bottom-normal">
                <label className="text-size-bigger text-weight-bolder">{t('CardInformation')}</label>
              </div>
              {/* Start of adyen card */}
              <div id="adyen-container" />
              {/* End of adyen card */}

              <div className="padding-top-bottom-normal payment-credit-card__save">
                <div
                  className={`flex flex-middle flex-space-between payment-credit-card__save-switch ${this.state
                    .saveCard && 'active'}`}
                >
                  <label className="text-size-bigger text-weight-bolder padding-top-bottom-normal">
                    {t('SaveCard')}
                  </label>
                  <SwitchButton
                    id="adyen-save-card"
                    checked={this.state.saveCard}
                    onChange={() => {
                      this.setState(state => ({
                        saveCard: !state.saveCard,
                      }));
                    }}
                  />
                </div>
                <p className="text-line-height-normal payment-credit-card__save-text">{t('SaveCardAuthorize')}</p>
              </div>
              <div className="payment-credit-card__secure">
                <div className="padding-top-bottom-normal">
                  <label className="text-size-bigger text-weight-bolder">{t('SecurePaymentBy')}</label>
                </div>
                <div className="text-line-height-normal payment-credit-card__save-text flex flex-middle flex-space-between">
                  <img src={AdyenSecurity} alt="pci" className="payment-credit-card__secure-image" />
                  <p className="payment-credit-card__secure-text">
                    <Trans i18nKey="OrderingPayment.SecurityHint">
                      Our card payment service is under PCI compliance protection to protect and encrypt cardholder data
                      transmissions.
                      <a
                        className="text-weight-bolder link__non-underline payment-credit-card__link"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://www.adyen.com/platform/certifications"
                      >
                        Know more here
                      </a>
                    </Trans>
                  </p>
                </div>
              </div>
            </div>
            <Loader className={'loading-cover opacity'} loaded={!this.state.payNowLoading} />
          </form>
          {/* end of card form */}
        </div>
        <footer
          ref={ref => (this.footerEl = ref)}
          className="ordering-payment__footer flex__shrink-fixed footer padding-top-bottom-small padding-left-right-normal"
        >
          <CreateOrderButton
            className="margin-top-bottom-smaller"
            history={history}
            buttonType="submit"
            data-heap-name="ordering.payment.adyen.pay-btn"
            disabled={!this.state.isAdyenCardLoaded} // Disable this button until dom is ready
            beforeCreateOrder={() => {
              if (!this.state.isCardValid) {
                // Trigger card submit to utilize adyen component verification
                this.card.submit();
                return;
              }

              this.setState({
                payNowLoading: true,
              });
            }}
            validCreateOrder={Boolean(this.card && this.state.isCardValid)}
            afterCreateOrder={async orderId => {
              // Trigger render form to submit to payment api
              // once order is created, a payment form will be rendered and posted to payment
              this.setState({
                submitToPayment: true,
                payNowLoading: false,
              });
            }}
          >
            <CurrencyNumber
              className="text-center text-weight-bolder text-uppercase"
              addonBefore={this.state.saveCard ? t('AddAndPay') : t('Pay')}
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
        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
        cartSummary: getCartSummary(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        merchantCountry: getMerchantCountry(state),
        user: getUser(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(AdyenPage);
