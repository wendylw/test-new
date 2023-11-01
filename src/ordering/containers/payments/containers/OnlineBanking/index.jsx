/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../../../components/HybridHeader';
import Loader from '../../components/Loader';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import { IconKeyArrowDown } from '../../../../../components/Icons';
import Constants from '../../../../../utils/constants';
import { getOnlineStoreInfo, getBusiness, getBusinessInfo } from '../../../../redux/modules/app';
import {
  getLoaderVisibility,
  getSelectedPaymentOption,
  getOnlineBankList,
  getTotal,
  getCleverTapAttributes,
  getReceiptNumber,
  getInitPaymentRequestErrorMessage,
  getInitPaymentRequestErrorCategory,
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

  constructor(props) {
    super(props);
    this.state = {
      payNowLoading: false,
    };
  }

  async componentDidMount() {
    const { initialize } = this.props;

    /**
     * Load all payment options action and except saved card list
     */
    await initialize(Constants.PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY);

    const { isInitPaymentFailed, initPaymentErrorMessage, initPaymentRequestErrorCategory } = this.props;

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
          errorCategory: initPaymentRequestErrorCategory,
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
        data-test-id="ordering.payment.online-banking.bank-select"
      >
        {onlineBankingList.map(banking => (
          <option
            className="text-size-small"
            disabled={!banking.available}
            key={`banking-${banking.agentCode}`}
            value={banking.agentCode}
          >
            {banking.name}
            {banking.available ? '' : ` (${t('TemporarilyUnavailable')})`}
          </option>
        ))}
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
        data-test-id="ordering.payment.online-banking.container"
      >
        <HybridHeader
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-test-id="ordering.payment.online-banking.header"
          isPage
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
                <span className="text-size-bigger text-weight-bolder text-capitalize">{t('SelectABank')}</span>
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
            data-test-id="ordering.payment.online-banking.pay-btn"
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

        <Loader className="loading-cover opacity" loaded={!loaderVisibility} />
      </section>
    );
  }
}

OnlineBanking.displayName = 'OnlineBanking';

OnlineBanking.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  match: PropTypes.object,
  onlineBankingList: PropTypes.array,
  currentPaymentOption: PropTypes.object,
  currentOnlineBanking: PropTypes.object,
  cleverTapAttributes: PropTypes.object,
  /* eslint-enable */
  total: PropTypes.number,
  receiptNumber: PropTypes.string,
  loaderVisibility: PropTypes.bool,
  isInitPaymentFailed: PropTypes.bool,
  initPaymentErrorMessage: PropTypes.string,
  initPaymentRequestErrorCategory: PropTypes.string,
  initialize: PropTypes.func,
  updateBankingSelected: PropTypes.func,
};

OnlineBanking.defaultProps = {
  total: 0,
  match: {},
  receiptNumber: null,
  onlineBankingList: [],
  loaderVisibility: false,
  currentPaymentOption: {},
  currentOnlineBanking: {},
  cleverTapAttributes: {},
  isInitPaymentFailed: false,
  initPaymentErrorMessage: '',
  initPaymentRequestErrorCategory: '',
  initialize: () => {},
  updateBankingSelected: () => {},
};

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => ({
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
      initPaymentRequestErrorCategory: getInitPaymentRequestErrorCategory(state),
      isInitPaymentFailed: getIsInitPaymentRequestStatusRejected(state),
    }),
    dispatch => ({
      initialize: bindActionCreators(initializeThunkCreator, dispatch),
      updateBankingSelected: bindActionCreators(actions.updateBankingSelected, dispatch),
    })
  )
)(OnlineBanking);
