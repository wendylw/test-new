/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import _find from 'lodash/find';
import { withTranslation } from 'react-i18next';
import Loader from '../components/Loader';
import Image from '../../../../components/Image';
import Header from '../../../../components/Header';
import RedirectForm from '../components/RedirectForm';
import CurrencyNumber from '../../../components/CurrencyNumber';
import CreateOrderButton from '../../../components/CreateOrderButton';
import { IconKeyArrowDown } from '../../../../components/Icons';
import Constants from '../../../../utils/constants';
import config from '../../../../config';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as homeActionCreators } from '../../../redux/modules/home';
import { getCartSummary } from '../../../../redux/modules/entities/carts';
import { getOnlineStoreInfo, getBusiness, getMerchantCountry } from '../../../redux/modules/app';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { actions as paymentActionCreators, getCurrentOrderId, getBankList } from '../../../redux/modules/payment';
import { getPaymentName, getPaymentRedirectAndWebHookUrl } from '../utils';
import './OrderingBanking.scss';
// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

class OnlineBanking extends Component {
  order = {};

  state = {
    agentCode: null,
    payNowLoading: false,
  };

  componentDidMount() {
    const { deliveryDetails } = this.props;
    const { deliveryToLocation } = deliveryDetails || {};

    this.updateBankList();
    this.props.homeActions.loadShoppingCart(
      deliveryToLocation.latitude &&
        deliveryToLocation.longitude && {
          lat: deliveryToLocation.latitude,
          lng: deliveryToLocation.longitude,
        }
    );
  }

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, business, merchantCountry } = this.props;
    const currentPayment = Constants.PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY;
    const { agentCode } = this.state;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || !agentCode) {
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
      paymentName: getPaymentName(merchantCountry, currentPayment),
      agentCode,
    };
  };

  updateBankList = async () => {
    const { paymentActions, merchantCountry } = this.props;

    if (merchantCountry) {
      await paymentActions.fetchBankList(merchantCountry);

      const findBank = _find(this.props.bankingList, { agentCode: this.state.agentCode });
      if (!findBank) {
        this.initAgentCode(this.props.bankingList);
      }
    }
  };

  componentDidUpdate = async preProps => {
    if (preProps.merchantCountry !== this.props.merchantCountry) {
      this.updateBankList();
    }
  };

  initAgentCode(bankingList) {
    if (bankingList && bankingList.length) {
      this.setState({
        agentCode: bankingList[0].agentCode,
      });
    } else {
      this.setState({
        agentCode: null,
      });
    }
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
        <select className="ordering-banking__select form__select text-size-biggest" disabled>
          <option>Select one</option>
        </select>
      );
    }

    return (
      <select
        className="ordering-banking__select form__select text-size-biggest"
        onChange={this.handleSelectBank.bind(this)}
        data-heap-name="ordering.payment.online-banking.bank-select"
      >
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
                    payNowLoading && !agentCode ? 'error' : ''
                  }`}
                >
                  {this.renderBankingList()}
                  <IconKeyArrowDown className="ordering-banking__icon icon icon__normal" />
                </div>
              </div>
              {payNowLoading && !agentCode ? (
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

        {payNowLoading && paymentData ? (
          <RedirectForm
            ref={ref => (this.form = ref)}
            action={config.storeHubPaymentEntryURL}
            method="POST"
            data={paymentData}
          />
        ) : null}

        <Loader className={'loading-cover opacity'} loaded={Boolean((bankingList || []).length)} />
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
