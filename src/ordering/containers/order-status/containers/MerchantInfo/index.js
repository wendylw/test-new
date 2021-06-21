import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import qs from 'qs';
import Header from '../../../../../components/Header';
import Constants from '../../../../../utils/constants';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { IconNext } from '../../../../../components/Icons';
import Utils from '../../../../../utils/utils';
import {
  actions as commonActionCreators,
  getReceiptNumber,
  getOrderStatus,
  getIsUseStorehubLogistics,
  getOrder,
} from '../../redux/common';

import './OrderingMerchantInfo.scss';

const { AVAILABLE_REPORT_DRIVER_ORDER_STATUSES } = Constants;

export class MerchantInfo extends Component {
  componentDidMount() {
    const { loadOrder, receiptNumber } = this.props;

    loadOrder(receiptNumber);
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

    return !AVAILABLE_REPORT_DRIVER_ORDER_STATUSES.includes(orderStatus);
  };

  render() {
    const { history, t, isUseStorehubLogistics, order } = this.props;
    const { storeInfo } = order || {};
    const { name, phone } = storeInfo || {};
    const isWebView = Utils.isWebview();

    return (
      <section className="ordering-merchant-info flex flex-column" data-heap-name="ordering.need-help.container">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="ordering.need-help.header"
          isPage={false}
          title={t('ContactUs')}
          navFunc={() => {
            if (history.length > 1) {
              history.goBack();
            } else {
              history.push({
                pathname: Constants.ROUTER_PATHS.THANK_YOU,
                search: window.location.search,
              });
            }
          }}
        />

        <div className="ordering-merchant-info__container padding-top-bottom-normal">
          <ul className="card padding-left-right-small margin-normal">
            <li className="ordering-merchant-info__item margin-left-right-small border__bottom-divider">
              <summary className="padding-top-bottom-smaller text-size-big text-weight-bolder">
                {t('StoreName')}
              </summary>
              <span className="ordering-merchant-info__description padding-top-bottom-smaller text-line-height-base text-opacity">
                {name}
              </span>
            </li>
            <li className="ordering-merchant-info__item margin-left-right-small border__bottom-divider">
              <summary className="padding-top-bottom-smaller text-size-big text-weight-bolder">
                {t('ContactInfo')}
              </summary>
              {isWebView ? (
                <span className="gray-font-opacity">{phone}</span>
              ) : (
                <a className="link link__non-underline link__block" href={`tel:${phone}`}>
                  {phone}
                </a>
              )}
            </li>
            <li className="ordering-merchant-info__item margin-left-right-small">
              <summary className="padding-top-bottom-smaller text-size-big text-weight-bolder">
                {t('StoreAddress')}
              </summary>
              <span className="ordering-merchant-info__description padding-top-bottom-smaller text-line-height-base text-opacity">
                {Utils.getValidAddress(storeInfo || {}, Constants.ADDRESS_RANGE.CITY)}
              </span>
            </li>
          </ul>
          {isUseStorehubLogistics ? (
            <div className="card margin-normal">
              <button
                disabled={this.isReportUnsafeDriverButtonDisabled()}
                onClick={this.handleReportUnsafeDriver}
                className="button button__block flex flex-middle flex-space-between padding-small"
                data-heap-name="ordering.need-help.report-driver-btn"
              >
                <span className="text-size-big text-weight-bolder padding-left-right-small">{t('ReportDriver')}</span>
                <IconNext className="icon icon__small" />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    );
  }
}
MerchantInfo.displayName = 'MerchantInfo';

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      receiptNumber: getReceiptNumber(state),
      orderStatus: getOrderStatus(state),
      order: getOrder(state),
      isUseStorehubLogistics: getIsUseStorehubLogistics(state),
    }),
    {
      loadOrder: commonActionCreators.loadOrder,
    }
  )
)(MerchantInfo);
