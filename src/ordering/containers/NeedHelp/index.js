import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import qs from 'qs';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { IconNext } from '../../../components/Icons';
import {
  actions as thankYouActionCreators,
  getReceiptNumber,
  getOrderStatus,
  getWebViewStatus,
  getIsUseStorehubLogistics,
  getOrder,
} from '../../redux/modules/thankYou';

import { CAN_REPORT_STATUS_LIST } from '../../redux/modules/reportDriver';

export class NeedHelp extends Component {
  componentDidMount() {
    const { thankYouActions, receiptNumber } = this.props;

    thankYouActions.loadOrder(receiptNumber);
  }

  handleReportUnsafeDriver = () => {
    const queryParams = {
      receiptNumber: this.props.receiptNumber,
    };

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.REPORT_DRIVER,
      search: qs.stringify(queryParams, { addQueryPrefix: true }),
    });
  };

  isReportUnsafeDriverButtonDisabled = () => {
    const { orderStatus } = this.props;

    return !CAN_REPORT_STATUS_LIST.includes(orderStatus);
  };

  render() {
    const { history, t, isUseStorehubLogistics, order, isWebView } = this.props;
    const { storeInfo } = order || {};
    const { name, phone, street1 } = storeInfo || {};

    return (
      <section className="need-help" data-heap-name="ordering.need-help.container">
        <Header
          className="has-right flex-middle"
          isPage={true}
          data-heap-name="ordering.need-help.header"
          title={t('ContactUs')}
          navFunc={() => {
            if (history.length) {
              history.goBack();
            } else {
              history.push({
                pathname: Constants.ROUTER_PATHS.THANK_YOU,
                search: window.location.search,
              });
            }
          }}
        />
        <div className="need-help__info-container">
          <ul className="list">
            <li className="item border__bottom-divider">
              <summary className="item__title store-info__item font-weight-bolder">{t('StoreName')}</summary>
              <span className="item__text gray-font-opacity">{name}</span>
            </li>
            {phone && (
              <li className="item border__bottom-divider">
                <summary className="item__title store-info__item font-weight-bolder">{t('ContactInfo')}</summary>
                {isWebView ? (
                  <span className="item__text gray-font-opacity">{phone}</span>
                ) : (
                  <a className="item__text link link__non-underline link__block" href={`tel:${phone}`}>
                    {phone}
                  </a>
                )}
              </li>
            )}
            <li className="item">
              <summary className="item__title store-info__item font-weight-bolder">{t('StoreAddress')}</summary>
              <span className="item__text gray-font-opacity">{street1}</span>
            </li>
          </ul>
        </div>
        {isUseStorehubLogistics ? (
          <div className="need-help__report-driver">
            <button
              disabled={this.isReportUnsafeDriverButtonDisabled()}
              onClick={this.handleReportUnsafeDriver}
              className="need-help__report-driver-button"
              data-heap-name="ordering.need-help.report-driver-btn"
            >
              <span className="need-help__report-driver-button-text">{t('ReportDriver')}</span>
              <IconNext className="need-help__report-driver-button-icon" />
            </button>
          </div>
        ) : null}
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      receiptNumber: getReceiptNumber(state),
      orderStatus: getOrderStatus(state),
      order: getOrder(state),
      isWebView: getWebViewStatus(state),
      isUseStorehubLogistics: getIsUseStorehubLogistics(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(NeedHelp);
