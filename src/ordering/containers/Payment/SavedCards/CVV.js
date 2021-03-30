import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import _toString from 'lodash/toString';
import _startsWith from 'lodash/startsWith';
import Header from '../../../../components/Header';
import Constants from '../../../../utils/constants';
import CreateOrderButton from '../../../components/CreateOrderButton';
import CurrencyNumber from '../../../components/CurrencyNumber';
import RedirectForm from '../components/RedirectForm';
import Loader from '../components/Loader';
import config from '../../../../config';
import Utils from '../../../../utils/utils';

import { bindActionCreators, compose } from 'redux';
import { actions as homeActionCreators } from '../../../redux/modules/home';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { getPaymentRedirectAndWebHookUrl, getCardLabel } from '../utils';
import {
  actions as appActionCreators,
  getUser,
  getMerchantCountry,
  getOnlineStoreInfo,
  getBusiness,
  getBusinessInfo,
  getCartBilling,
} from '../../../redux/modules/app';
import {
  actions as paymentActionCreators,
  getCardList,
  getCurrentOrderId,
  getSelectedPaymentCard,
} from '../../../redux/modules/payment';
import StripeCVV from './components/StripeCVV';
import '../PaymentCreditCard.scss';
import './CVV.scss';
import { STRIPE_LOAD_TIME_OUT } from '../Stripe/constants';

class CardCVV extends Component {
  state = {
    // TODO: Move whole state to redux store in Payment 2.0
    payNowLoading: false,
    isCvvComponentReady: false,
    isCvvValid: false,
    submitToPayment: false,
    cvcToken: null,
  };
  timeoutId = null;
  headerEl = null;
  footerEl = null;
  cvcInputRef = React.createRef();

  componentDidMount() {
    const { selectedPaymentCard, history } = this.props;

    if (!selectedPaymentCard || !selectedPaymentCard.cardToken) {
      history.goBack();
      return;
    }

    this.timeoutId = setTimeout(this.handleLoadTimeout, STRIPE_LOAD_TIME_OUT);
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  handleLoadTimeout = () => {
    if (this.state.isCvvComponentReady) {
      return;
    }
    const { t, history, showMessageModal } = this.props;

    console.error('Load Stripe time out');

    showMessageModal({
      message: t('TimeOut'),
      description: t('ConnectionIssue'),
    });

    history.goBack();
  };

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, business, businessInfo, user, selectedPaymentCard } = this.props;

    if (!onlineStoreInfo || !currentOrder || !user) {
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
      paymentName: Constants.PAYMENT_PROVIDERS.STRIPE,
      paymentOption: Constants.PAYMENT_API_PAYMENT_OPTIONS.TOKENIZATION,
      isInternal: _startsWith(planId, 'internal'),
      source: Utils.getOrderSource(),
      cvcToken: this.state.cvcToken,
    };
  };

  handleOrderBeforeCreate = async () => {
    this.setState({
      payNowLoading: true,
    });

    const result = await this.cvcInputRef.current.getCvcToken();
    const cvcToken = _get(result, 'token.id', null);
    const errorCode = _get(result, 'error.code', null);

    this.setState(
      {
        cvcToken,
        isCvvValid: !errorCode,
      },
      () => {
        this.setState({
          payNowLoading: this.isValidCreateOrder,
        });
      }
    );
  };

  get isValidCreateOrder() {
    const { cvcToken, isCvvValid } = this.state;

    return cvcToken && isCvvValid;
  }

  renderRedirectForm = () => {
    const { currentOrder } = this.props;

    if (!currentOrder) return null;
    if (!this.state.submitToPayment) return null;

    const requestData = { ...this.getPaymentEntryRequestData() };
    const { receiptNumber } = requestData;

    return (
      receiptNumber && (
        <RedirectForm
          key="stripe-payment-redirect-form"
          action={config.storeHubPaymentEntryURL}
          method="POST"
          data={requestData}
        />
      )
    );
  };

  handleCvvComponentOnReady = () => {
    this.setState({
      isCvvComponentReady: true,
    });
  };

  handleCvvCodeChange = result => {
    const complete = _get(result, 'complete', false);
    const errorCode = _get(result, 'error.code', null);

    this.setState({
      isCvvValid: complete && !errorCode,
    });
  };

  render() {
    const { t, history, cartBilling, selectedPaymentCard, merchantCountry } = this.props;
    const { total } = cartBilling;
    const { isCvvComponentReady, payNowLoading, isCvvValid } = this.state;

    if (!selectedPaymentCard || !selectedPaymentCard.cardInfo) return null;

    return (
      <section className="payment-credit-card flex flex-column">
        <Header
          headerEl={ref => {
            this.headerEl = ref;
          }}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage={true}
          title={t('PayViaCard')}
          navFunc={() => {
            history.goBack();
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
            <StripeCVV
              onChange={this.handleCvvCodeChange}
              onReady={this.handleCvvComponentOnReady}
              ref={this.cvcInputRef}
              merchantCountry={merchantCountry}
            />
          </div>
          <Loader className={'loading-cover opacity'} loaded={isCvvComponentReady && !payNowLoading} />
        </div>
        <footer
          ref={ref => {
            this.footerEl = ref;
          }}
          className="payment-credit-card__footer flex__shrink-fixed footer padding-top-bottom-small padding-left-right-normal"
        >
          <CreateOrderButton
            className="margin-top-bottom-smaller"
            history={history}
            buttonType="submit"
            disabled={!isCvvComponentReady || !isCvvValid || payNowLoading}
            beforeCreateOrder={this.handleOrderBeforeCreate}
            validCreateOrder={this.isValidCreateOrder}
            afterCreateOrder={orderId => {
              this.setState({
                submitToPayment: true,
                payNowLoading: !!orderId,
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
        cartBilling: getCartBilling(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        selectedPaymentCard: getSelectedPaymentCard(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        user: getUser(state),
        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
      };
    },
    dispatch => ({
      showMessageModal: bindActionCreators(appActionCreators.showMessageModal, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(CardCVV);
