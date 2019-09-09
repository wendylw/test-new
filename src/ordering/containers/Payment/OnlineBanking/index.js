/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import Loader from '../components/Loader';
import Image from '../../../../components/Image';
import Header from '../../../../components/Header';
import RedirectForm from '../components/RedirectForm';
import CurrencyNumber from '../../../components/CurrencyNumber';
import Constants from '../../../../utils/constants';
import config from '../../../../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo, getBusiness } from '../../../redux/modules/app';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { actions as paymentActions, getCurrentPayment, getCurrentOrderId, getBankList } from '../../../redux/modules/payment';

// Example URL: http://nike.storehub.local:3002/#/payment/bankcard

class OnlineBanking extends Component {
  order = {};

  state = {
    agentCode: null,
    payNowLoading: false,
  };

  getPaymentEntryRequestData = () => {
    const {
      onlineStoreInfo,
      currentOrder,
      currentPayment,
      business,
    } = this.props;
    const { agentCode } = this.state;
    const h = config.h();
    const queryString = `?h=${encodeURIComponent(h)}`;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || !agentCode) {
      return null;
    }

    const redirectURL = `${config.storehubPaymentResponseURL.replace('{{business}}', business)}${queryString}`;
    const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('{{business}}', business)}${queryString}`;

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      businessName: business,
      redirectURL: redirectURL,
      webhookURL: webhookURL,
      paymentName: currentPayment,
      agentCode,
    };
  }

  componentWillMount() {
    const { paymentActions } = this.props;

    paymentActions.fetchBankList();
  }

  componentDidMount() {
    const { bankingList } = this.props;

    this.initAgentCode(bankingList);
  }

  componentWillReceiveProps(nextProps) {
    const { bankingList } = nextProps;

    if (bankingList && bankingList.length !== (this.props.bankingList || []).length) {
      this.initAgentCode(bankingList);
    }
  }

  initAgentCode(bankingList) {
    if (bankingList && bankingList.length) {
      this.setState({
        agentCode: bankingList[0].agentCode
      });
    }
  }

  async payNow() {
    let payState = {
      payNowLoading: true
    };

    this.setState(payState);
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
        {
          bankingList.map((banking, key) => {
            return (
              <option
                key={`banking-${key}`}
                value={banking.agentCode}
              >
                {banking.name}
              </option>
            );
          })
        }
      </select>
    );
  }

  render() {
    const {
      match,
      history,
      bankingList,
      currentOrder,
      onlineStoreInfo
    } = this.props;
    const { total } = currentOrder || {};
    const { logo } = onlineStoreInfo || {};
    const {
      agentCode,
      payNowLoading,
    } = this.state;
    const paymentData = this.getPaymentEntryRequestData();


    return (
      <section className={`table-ordering__bank-payment ${match.isExact ? '' : 'hide'}`}>
        <Header
          className="border__botton-divider gray has-right"
          isPage={true}
          title="Pay via Online Banking"
          navFunc={() => {
            history.replace(Constants.ROUTER_PATHS.ORDERING_PAYMENT, history.location.state);
          }}
        />

        <div className="payment-bank">
          <Image
            className="logo-default__image-container"
            src={logo}
          />
          <CurrencyNumber
            className="payment-bank__money font-weight-bold text-center"
            money={total || 0}
          />

          <form id="bank-2c2p-form" className="form">
            <div className="payment-bank__form-item">
              <div className="flex flex-middle flex-space-between">
                <label className="payment-bank__label font-weight-bold">Select a bank</label>
              </div>
              <div className="payment-bank__card-container">
                <div className={`input ${payNowLoading && !agentCode ? 'has-error' : ''}`}>
                  {this.renderBankingList()}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                    <path d="M0 0h24v24H0z" fill="none" />
                  </svg>
                </div>
                {
                  payNowLoading && !agentCode
                    ? (
                      <div className="error-message__container">
                        <span className="error-message">Please select a bank to continue</span>
                      </div>
                    )
                    : null
                }
              </div>
            </div>
          </form>
        </div>

        <div className="footer-operation">
          <button
            className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
            onClick={this.payNow.bind(this)}
            disabled={payNowLoading && agentCode}
          >{
              payNowLoading && !agentCode
                ? 'Redirecting'
                : (
                  <CurrencyNumber
                    className="font-weight-bold text-center"
                    addonBefore="Pay"
                    money={total || 0}
                  />
                )
            }
          </button>
        </div>

        {
          payNowLoading && paymentData
            ? (
              <RedirectForm
                ref={ref => this.form = ref}
                action={config.storehubPaymentEntryURL}
                method="POST"
                data={paymentData}
              />
            )
            : null
        }

        <Loader loaded={Boolean((bankingList || []).length)} />
      </section>
    );
  }
}

export default connect(
  state => {
    const currentOrderId = getCurrentOrderId(state);

    return {
      bankingList: getBankList(state),
      business: getBusiness(state),
      currentPayment: getCurrentPayment(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      currentOrder: getOrderByOrderId(state, currentOrderId),
    };
  },
  dispatch => ({
    paymentActions: bindActionCreators(paymentActions, dispatch),
  }),
)(OnlineBanking);
