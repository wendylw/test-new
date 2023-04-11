/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../../../components/HybridHeader';
import Loader from '../../components/Loader';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import { IconKeyArrowDown } from '../../../../../components/Icons';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusiness,
  getBusinessInfo,
} from '../../../../redux/modules/app';
import {
  getLoaderVisibility,
  getSelectedPaymentOption,
  getOnlineBankList,
  getTotal,
  getCleverTapAttributes,
  getReceiptNumber,
  getInitPaymentRequestErrorMessage,
  getIsInitPaymentRequestStatusRejected,
} from '../../redux/common/selectors';
import { initialize as initializeThunkCreator } from '../../redux/common/thunks';
import { actions } from './redux';
import { getSelectedOnlineBanking } from './redux/selectors';
import './OrderingBanking.scss';
import prefetch from '../../../../../common/utils/prefetch-assets';
import CleverTap from '../../../../../utils/clevertap';
import logger from '../../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';
// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

class OnlineBanking extends Component {
  order = {};

  state = {
    payNowLoading: false,
  };

  async componentDidMount() {
    const { initialize } = this.props;

    /**
     * Load all payment options action and except saved card list
     */
    await initialize(Constants.PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY);

    const { isInitPaymentFailed, initPaymentErrorMessage } = this.props;

    if (isInitPaymentFailed) {
      logger.error(
        'Ordering_OnlineBanking_InitializeFailed',
        {
          message: initPaymentErrorMessage,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.CHECKOUT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].SELECT_PAYMENT_METHOD,
          },
        }
      );
    }

    prefetch(['ORD_PMT'], ['OrderingPayment']);
  }

  getPaymentEntryRequestData = () => {
    const { currentPaymentOption, currentOnlineBanking } = this.props;
    const { paymentProvider } = currentPaymentOption;
    const { agentCode } = currentOnlineBanking;

    return {
      paymentProvider,
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

  handleAfterCreateOrder = orderId => {
    this.setState({
      payNowLoading: !!orderId,
    });

    if (!orderId) {
      logger.error(
        'Ordering_OnlineBanking_CreateOrderFailed',
        {
          message: 'Failed to create order via online banking',
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

    const { currentOnlineBanking } = this.props;

    logger.log('Ordering_Payment_OrderCreatedByOnlineBanking', {
      id: orderId,
      method: currentOnlineBanking.agentCode,
    });
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
      total,
      loaderVisibility,
      currentPaymentOption,
      currentOnlineBanking,
      cleverTapAttributes,
      receiptNumber,
    } = this.props;
    const { payNowLoading } = this.state;

    return (
      <section
        className={`ordering-banking flex flex-column ${match.isExact ? '' : 'hide'}`}
        data-heap-name="ordering.payment.online-banking.container"
      >
        <HybridHeader
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.payment.online-banking.header"
          isPage={true}
          title={t('PayViaOnlineBanking')}
          navFunc={() => {
            CleverTap.pushEvent('online banking - click back arrow');
            history.goBack();
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
            orderId={receiptNumber}
            total={total}
            className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
            data-test-id="payMoney"
            data-heap-name="ordering.payment.online-banking.pay-btn"
            disabled={payNowLoading}
            beforeCreateOrder={() => {
              CleverTap.pushEvent('online banking - click continue', {
                ...cleverTapAttributes,
                'payment method': currentPaymentOption?.paymentName,
                'bank name': currentPaymentOption?.paymentProvider,
              });
              this.setState({
                payNowLoading: true,
              });
            }}
            afterCreateOrder={this.handleAfterCreateOrder}
            paymentName={currentPaymentOption.paymentProvider}
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

        <Loader className={'loading-cover opacity'} loaded={!loaderVisibility} />
      </section>
    );
  }
}
OnlineBanking.displayName = 'OnlineBanking';

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => {
      return {
        onlineBankingList: getOnlineBankList(state),
        loaderVisibility: getLoaderVisibility(state),
        currentOnlineBanking: getSelectedOnlineBanking(state),
        currentPaymentOption: getSelectedPaymentOption(state),

        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
        total: getTotal(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        cleverTapAttributes: getCleverTapAttributes(state),
        receiptNumber: getReceiptNumber(state),
        initPaymentErrorMessage: getInitPaymentRequestErrorMessage(state),
        isInitPaymentFailed: getIsInitPaymentRequestStatusRejected(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      initialize: bindActionCreators(initializeThunkCreator, dispatch),
      updateBankingSelected: bindActionCreators(actions.updateBankingSelected, dispatch),
    })
  )
)(OnlineBanking);
