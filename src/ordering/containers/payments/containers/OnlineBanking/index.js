/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import Image from '../../../../../components/Image';
import Header from '../../../../../components/Header';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import { IconKeyArrowDown } from '../../../../../components/Icons';
import Constants from '../../../../../utils/constants';
import Utils from '../../../../../utils/utils';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getDeliveryDetails, actions as customerActionCreators } from '../../../../redux/modules/customer';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusiness,
  getCartBilling,
  getBusinessInfo,
  getStoreInfoForCleverTap,
} from '../../../../redux/modules/app';
import { getPaymentsPendingState, getSelectedPaymentOption, getOnlineBankList } from '../../redux/common/selectors';
import { loadPaymentOptions } from '../../redux/common/thunks';
import { actions } from './redux';
import { getSelectedOnlineBanking } from './redux/selectors';
import './OrderingBanking.scss';
import CleverTap from '../../../../../utils/clevertap';
// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

class OnlineBanking extends Component {
  order = {};

  state = {
    payNowLoading: false,
  };

  async componentDidMount() {
    const { deliveryDetails, customerActions, loadPaymentOptions } = this.props;
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
    loadPaymentOptions(Constants.PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY);
  }

  getPaymentEntryRequestData = () => {
    const { currentPaymentOption, currentOnlineBanking } = this.props;
    const { paymentProvider } = currentPaymentOption;
    const { agentCode } = currentOnlineBanking;

    return {
      // paymentProvider is sent to payment api as paymentName as a parameter, which is the parameter name designed by payment api
      paymentName: paymentProvider,
      agentCode,
    };
  };

  handleSelectBank = e => {
    const { updateBankingSelected, onlineBankingList, currentOnlineBanking } = this.props;
    const currentAgentCode = e.target.value;
    const { available } = onlineBankingList.find(banking => banking.agentCode === currentAgentCode);
    const { agentCode } = currentOnlineBanking;

    if (agentCode !== currentAgentCode && available) {
      updateBankingSelected(currentAgentCode);
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
      storeInfoForCleverTap,
    } = this.props;
    const { total } = cartBilling || {};
    const { logo } = onlineStoreInfo || {};
    const { payNowLoading } = this.state;

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
            CleverTap.pushEvent('online banking - click back arrow');
            history.replace({
              pathname: Constants.ROUTER_PATHS.ORDERING_PAYMENT,
              search: window.location.search,
            });
          }}
        />

        <div className="ordering-banking__container padding-top-bottom-normal">
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
              CleverTap.pushEvent('online banking - click continue', {
                ...storeInfoForCleverTap,
                'payment method': currentPaymentOption?.paymentName,
                'bank name': currentPaymentOption?.paymentProvider,
              });
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
            paymentExtraData={this.getPaymentEntryRequestData()}
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

        <Loader className={'loading-cover opacity'} loaded={!pendingPaymentOptions} />
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => {
      return {
        onlineBankingList: getOnlineBankList(state),
        pendingPaymentOptions: getPaymentsPendingState(state),
        currentOnlineBanking: getSelectedOnlineBanking(state),
        currentPaymentOption: getSelectedPaymentOption(state),

        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
        cartBilling: getCartBilling(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        deliveryDetails: getDeliveryDetails(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
      loadPaymentOptions: bindActionCreators(loadPaymentOptions, dispatch),
      updateBankingSelected: bindActionCreators(actions.updateBankingSelected, dispatch),
    })
  )
)(OnlineBanking);
