import React, { Component } from 'react';
import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import HybridHeader from '../../../../../components/HybridHeader';
import Loader from '../../components/Loader';
import Constants from '../../../../../utils/constants';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import Utils from '../../../../../utils/utils';

import { bindActionCreators, compose } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusiness,
  getBusinessInfo,
  getUser,
} from '../../../../redux/modules/app';
import SaveCardSwitch from '../../components/CreditCard/SaveCardSwitch';
import CreditCardSecureInfo from '../../components/CreditCard/CreditCardSecureInfo';
import { getSelectedPaymentOption, getTotal } from '../../redux/common/selectors';
import { loadPaymentOptions, loadBilling } from '../../redux/common/thunks';
import '../../styles/PaymentCreditCard.scss';

/**
 * TODO: Adyen is unavailable at long time, so we needn't maintenance this file for now
 */
class AdyenPage extends Component {
  state = {
    isAdyenCardLoaded: false,
    isCardValid: false,
    submitToPayment: false,
    saveCard: true,
  };
  card = null;

  componentDidMount = async () => {
    const { loadPaymentOptions, loadBilling } = this.props;

    await loadBilling();

    this.initAdyenCard();
    loadPaymentOptions(Constants.PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY);
  };

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
    const { user, currentPaymentOption } = this.props;
    const { paymentProvider } = currentPaymentOption;
    const { state, browserInfo } = this.card;
    const { data: paymentMethod } = state;

    const { saveCard } = this.state;

    return {
      paymentProvider,
      browserInfo: JSON.stringify(browserInfo || {}),
      userId: user.consumerId,
      ...paymentMethod,
      type: saveCard
        ? Constants.ADYEN_PAYMENT_TYPE.PAY_WITH_SAVE_CARD
        : Constants.ADYEN_PAYMENT_TYPE.PAY_WITHOUT_SAVE_CARD,
    };
  };

  handleSubmit = e => {
    e.preventDefault();

    return;
  };

  render() {
    const { t, history, total, currentPaymentOption } = this.props;

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

              <SaveCardSwitch
                value={this.state.saveCard}
                onChange={value => {
                  this.setState({
                    saveCard: value,
                  });
                }}
              />

              <CreditCardSecureInfo paymentProvider={currentPaymentOption.paymentProvider} />
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
            paymentExtraData={this.getPaymentEntryRequestData()}
            processing={this.state.payNowLoading}
            loaderText={t('Processing')}
          >
            <CurrencyNumber
              className="text-center text-weight-bolder text-uppercase"
              addonBefore={this.state.saveCard ? t('AddAndPay') : t('Pay')}
              money={total || 0}
            />
          </CreateOrderButton>
        </footer>
      </section>
    );
  }
}
AdyenPage.displayName = 'AdyenPage';

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => {
      return {
        currentPaymentOption: getSelectedPaymentOption(state),
        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
        total: getTotal(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        user: getUser(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      loadPaymentOptions: bindActionCreators(loadPaymentOptions, dispatch),
      loadBilling: bindActionCreators(loadBilling, dispatch),
    })
  )
)(AdyenPage);
