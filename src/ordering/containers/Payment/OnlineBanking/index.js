/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import _get from 'lodash/get';
import _toString from 'lodash/toString';
import _startsWith from 'lodash/startsWith';
import { withTranslation } from 'react-i18next';
import Loader from '../components/Loader';
import Image from '../../../../components/Image';
import Header from '../../../../components/Header';
import RedirectForm from '../components/RedirectForm';
import CurrencyNumber from '../../../components/CurrencyNumber';
import CreateOrderButton from '../../../components/CreateOrderButton';
import { IconKeyArrowDown } from '../../../../components/Icons';
import Constants from '../../../../utils/constants';
import Utils from '../../../../utils/utils';
import config from '../../../../config';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getDeliveryDetails, actions as customerActionCreators } from '../../../redux/modules/customer';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusiness,
  getCartBilling,
  getBusinessInfo,
} from '../../../redux/modules/app';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { actions as paymentActionCreators, getCurrentOrderId } from '../../../redux/modules/payment';
import {
  actions as paymentsActionCreator,
  getPaymentsPendingState,
  getOnlineBankingOption,
  getSelectedOnlineBanking,
  getOnlineBankList,
} from '../redux/payments';
import { getPaymentRedirectAndWebHookUrl } from '../utils';
import './OrderingBanking.scss';
// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

class OnlineBanking extends Component {
  order = {};

  state = {
    payNowLoading: false,
  };

  async componentDidMount() {
    const { deliveryDetails, customerActions, paymentsActions } = this.props;
    const { addressId } = deliveryDetails || {};
    const type = Utils.getOrderTypeFromUrl();

    !addressId && (await customerActions.initDeliveryDetails(type));

    const { deliveryDetails: newDeliveryDetails } = this.props;
    const { deliveryToLocation } = newDeliveryDetails || {};

    await this.props.appActions.loadShoppingCart(
      deliveryToLocation.latitude &&
        deliveryToLocation.longitude && {
          lat: deliveryToLocation.latitude,
          lng: deliveryToLocation.longitude,
        }
    );

    /**
     * Load all payment options action and except saved card list
     */
    paymentsActions.loadPaymentOptions();
  }

  getPaymentEntryRequestData = () => {
    const {
      onlineStoreInfo,
      currentOrder,
      business,
      businessInfo,
      currentPaymentOption,
      currentOnlineBanking,
    } = this.props;
    const { paymentProvider } = currentPaymentOption;
    const { agentCode } = currentOnlineBanking;
    const planId = _toString(_get(businessInfo, 'planId', ''));

    if (!onlineStoreInfo || !currentOrder || !paymentProvider || !agentCode) {
      return null;
    }

    const { redirectURL, webhookURL } = getPaymentRedirectAndWebHookUrl(business);

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      businessName: business,
      redirectURL: redirectURL,
      webhookURL: webhookURL,
      // paymentProvider is sent to payment api as paymentName as a parameter, which is the parameter name designed by payment api
      paymentName: paymentProvider,
      agentCode,
      isInternal: _startsWith(planId, 'internal'),
      source: Utils.getOrderSource(),
    };
  };

  handleSelectBank = e => {
    const { paymentsActions, onlineBankingList, currentOnlineBanking } = this.props;
    const currentAgentCode = e.target.value;
    const { available } = onlineBankingList.find(banking => banking.agentCode === currentAgentCode);
    const { agentCode } = currentOnlineBanking;

    if (agentCode !== currentAgentCode && available) {
      paymentsActions.updateOnlineBankingSelected(currentAgentCode);
    }
  };

  renderBankingList() {
    const { t, onlineBankingList } = this.props;

    if (!onlineBankingList || !onlineBankingList.length) {
      return (
        <select className="ordering-banking__select form__select text-size-biggest" disabled>
          <option>Select one</option>
        </select>
      );
    }

    return (
      <select
        className="ordering-banking__select form__select text-size-biggest"
        onChange={this.handleSelectBank}
        data-heap-name="ordering.payment.online-banking.bank-select"
      >
        {onlineBankingList.map(banking => {
          return (
            <option
              className="text-size-small"
              disabled={!banking.available}
              key={`banking-${banking.agentCode}`}
              value={banking.agentCode}
            >
              {banking.name}
              {banking.available ? '' : ` (${t('TemporarilyUnavailable')})`}
            </option>
          );
        })}
      </select>
    );
  }

  render() {
    const {
      t,
      match,
      history,
      cartBilling,
      onlineStoreInfo,
      pendingPaymentOptions,
      currentPaymentOption,
      currentOnlineBanking,
    } = this.props;
    const { total } = cartBilling || {};
    const { logo } = onlineStoreInfo || {};
    const { payNowLoading } = this.state;
    const paymentData = this.getPaymentEntryRequestData();

    return (
      <section
        className={`ordering-banking flex flex-column ${match.isExact ? '' : 'hide'}`}
        data-heap-name="ordering.payment.online-banking.container"
      >
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.payment.online-banking.header"
          isPage={true}
          title={t('PayViaOnlineBanking')}
          navFunc={() => {
            history.replace({
              pathname: Constants.ROUTER_PATHS.ORDERING_PAYMENT,
              search: window.location.search,
            });
          }}
        />

        <div className="ordering-banking__container padding-top-bottom-normal">
          <Image className="ordering-banking__logo logo logo__bigger margin-normal" src={logo} />
          <div className="text-center padding-top-bottom-normal">
            <CurrencyNumber className="text-center text-size-large text-weight-bolder" money={total || 0} />
          </div>

          <form id="bank-2c2p-form" className="form">
            <div className="padding-normal">
              <div className="padding-top-bottom-normal">
                <label className="text-size-bigger text-weight-bolder text-capitalize">{t('SelectABank')}</label>
              </div>
              <div className="ordering-banking__group form__group">
                <div
                  className={`ordering-banking__input form__input padding-left-right-normal ${
                    payNowLoading && !currentOnlineBanking.agentCode ? 'error' : ''
                  }`}
                >
                  {this.renderBankingList()}
                  <IconKeyArrowDown className="ordering-banking__icon icon icon__normal" />
                </div>
              </div>
              {payNowLoading && !currentOnlineBanking.agentCode ? (
                <span className="form__error-message margin-top-bottom-small">{t('PleaseSelectABankToContinue')}</span>
              ) : null}
            </div>
          </form>
        </div>

        <footer className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <CreateOrderButton
            history={history}
            className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
            data-test-id="payMoney"
            data-heap-name="ordering.payment.online-banking.pay-btn"
            disabled={payNowLoading}
            beforeCreateOrder={() => {
              this.setState({
                payNowLoading: true,
              });
            }}
            afterCreateOrder={orderId => {
              this.setState({
                payNowLoading: !!orderId,
              });
            }}
            paymentName={currentPaymentOption.paymentProvider}
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

        {payNowLoading && paymentData ? (
          <RedirectForm
            ref={ref => (this.form = ref)}
            action={config.storeHubPaymentEntryURL}
            method="POST"
            data={paymentData}
          />
        ) : null}

        <Loader className={'loading-cover opacity'} loaded={!pendingPaymentOptions} />
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
        onlineBankingList: getOnlineBankList(state),
        pendingPaymentOptions: getPaymentsPendingState(state),
        currentOnlineBanking: getSelectedOnlineBanking(state),
        currentPaymentOption: getOnlineBankingOption(state),

        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
        cartBilling: getCartBilling(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        deliveryDetails: getDeliveryDetails(state),
      };
    },
    dispatch => ({
      paymentsActions: bindActionCreators(paymentsActionCreator, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(OnlineBanking);
