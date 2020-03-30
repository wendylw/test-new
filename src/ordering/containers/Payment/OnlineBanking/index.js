/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import qs from 'qs';
import { withTranslation } from 'react-i18next';
import Loader from '../components/Loader';
import Image from '../../../../components/Image';
import Header from '../../../../components/Header';
import RedirectForm from '../components/RedirectForm';
import CurrencyNumber from '../../../components/CurrencyNumber';
import Constants from '../../../../utils/constants';
import Utils from '../../../../utils/utils';
import config from '../../../../config';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as homeActionCreators } from '../../../redux/modules/home';
import { getCartSummary } from '../../../../redux/modules/entities/carts';
import { getOnlineStoreInfo, getBusiness, getMerchantCountry } from '../../../redux/modules/app';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import {
  actions as paymentActionCreators,
  getCurrentPayment,
  getCurrentOrderId,
  getBankList,
} from '../../../redux/modules/payment';
import { getPaymentName } from '../utils';
// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

class OnlineBanking extends Component {
  order = {};

  state = {
    agentCode: null,
    payNowLoading: false,
  };

  getPaymentEntryRequestData = () => {
    const { history, onlineStoreInfo, currentOrder, currentPayment, business, merchantCountry } = this.props;
    const { agentCode } = this.state;
    const h = config.h();
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const queryString = `?h=${encodeURIComponent(h)}`;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || !agentCode) {
      return null;
    }

    const redirectURL = `${config.storehubPaymentResponseURL.replace('%business%', business)}${queryString}${
      type ? '&type=' + type : ''
    }`;
    const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('%business%', business)}${queryString}`;

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      businessName: business,
      redirectURL: redirectURL,
      webhookURL: webhookURL,
      paymentName: getPaymentName(merchantCountry, currentPayment),
      agentCode,
    };
  };

  componentDidMount() {
    this.props.homeActions.loadShoppingCart();
  }

  componentDidUpdate = async (preProps) => {
    if(preProps.merchantCountry !== this.props.merchantCountry) {
      const { paymentActions, merchantCountry } = this.props;
      await paymentActions.fetchBankList(merchantCountry);
      if(!this.state.agentCode) {
        this.initAgentCode(this.props.bankingList);
      }
    }
  }

  initAgentCode(bankingList) {
    if (bankingList && bankingList.length) {
      this.setState({
        agentCode: bankingList[0].agentCode,
      });
    }
  }

  async payNow() {
    this.setState(
      {
        payNowLoading: true,
      },
      async () => {
        const { history, paymentActions, cartSummary } = this.props;
        const { totalCashback } = cartSummary || {};
        const { agentCode } = this.state;
        const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

        await paymentActions.createOrder({ cashback: totalCashback, shippingType: type });

        const { currentOrder } = this.props;
        const { orderId } = currentOrder || {};

        if (orderId) {
          Utils.removeSessionVariable('additionalComments');
          Utils.removeSessionVariable('deliveryComments');
        }

        this.setState({ payNowLoading: !!agentCode });
      }
    );
  }

  handleSelectBank(e) {
    this.setState({
      agentCode: e.target.value,
    });
  }

  renderBankingList() {
    const { bankingList } = this.props;

    if (!bankingList || !bankingList.length) {
      return (
        <select className="input__block" disabled>
          <option>Select one</option>
        </select>
      );
    }

    return (
      <select className="input__block" onChange={this.handleSelectBank.bind(this)}>
        {bankingList.map((banking, key) => {
          return (
            <option key={`banking-${key}`} value={banking.agentCode}>
              {banking.name}
            </option>
          );
        })}
      </select>
    );
  }

  render() {
    const { t, match, history, bankingList, cartSummary, onlineStoreInfo } = this.props;
    const { total } = cartSummary || {};
    const { logo } = onlineStoreInfo || {};
    const { agentCode, payNowLoading } = this.state;
    const paymentData = this.getPaymentEntryRequestData();

    return (
      <section className={`table-ordering__bank-payment ${match.isExact ? '' : 'hide'}`}>
        <Header
          className="border__bottom-divider gray has-right flex-middle"
          isPage={true}
          title={t('PayViaOnlineBanking')}
          navFunc={() => {
            history.replace({
              pathname: Constants.ROUTER_PATHS.ORDERING_PAYMENT,
              search: window.location.search,
            });
          }}
        />

        <div className="payment-bank">
          <Image className="logo-default__image-container" src={logo} />
          <CurrencyNumber className="payment-bank__money font-weight-bold text-center" money={total || 0} />

          <form id="bank-2c2p-form" className="form">
            <div className="payment-bank__form-item">
              <div className="flex flex-middle flex-space-between">
                <label className="payment-bank__label font-weight-bold">{t('SelectABank')}</label>
              </div>
              <div className="payment-bank__card-container">
                <div className={`input ${payNowLoading && !agentCode ? 'has-error' : ''}`}>
                  {this.renderBankingList()}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                    <path d="M0 0h24v24H0z" fill="none" />
                  </svg>
                </div>
                {payNowLoading && !agentCode ? (
                  <div className="error-message__container">
                    <span className="error-message">{t('PleaseSelectABankToContinue')}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </form>
        </div>

        <div className="footer-operation">
          <button
            className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
            onClick={this.payNow.bind(this)}
            disabled={payNowLoading}
          >
            {payNowLoading ? (
              <div className="loader"></div>
            ) : (
              <CurrencyNumber className="font-weight-bold text-center" addonBefore={t('Pay')} money={total || 0} />
            )}
          </button>
        </div>

        {payNowLoading && paymentData ? (
          <RedirectForm
            ref={ref => (this.form = ref)}
            action={config.storeHubPaymentEntryURL}
            method="POST"
            data={paymentData}
          />
        ) : null}

        <Loader loaded={Boolean((bankingList || []).length)} />
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
        bankingList: getBankList(state),
        business: getBusiness(state),
        cartSummary: getCartSummary(state),
        currentPayment: getCurrentPayment(state),
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
)(OnlineBanking);
