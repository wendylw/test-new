import { compose } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import qs from 'qs';
import HybridHeader from '../../../../../components/HybridHeader';
import prefetch from '../../../../../common/utils/prefetch-assets';
import Constants, { AVAILABLE_REPORT_DRIVER_ORDER_STATUSES } from '../../../../../utils/constants';
import { IconNext } from '../../../../../components/Icons';
import Utils from '../../../../../utils/utils';
import { loadOrder as loadOrderThunk } from '../../redux/thunks';
import { getReceiptNumber, getOrderStatus, getIsUseStorehubLogistics, getOrder } from '../../redux/selector';

import './OrderingMerchantInfo.scss';

export class MerchantInfo extends Component {
  componentDidMount() {
    const { loadOrder, receiptNumber } = this.props;

    loadOrder(receiptNumber);
    prefetch(['ORD_RD', 'ORD_TY', 'ORD_PL'], ['ReportDriver', 'OrderingThankYou']);
  }

  handleReportUnsafeDriver = () => {
    const { receiptNumber, history } = this.props;

    const queryParams = {
      receiptNumber,
    };

    history.push({
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
      <section className="ordering-merchant-info flex flex-column" data-test-id="ordering.need-help.container">
        <HybridHeader
          className="flex-middle"
          contentClassName="flex-middle"
          data-test-id="ordering.need-help.header"
          isPage
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
          <ul className="card padding-left-right-small margin-small">
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
                <a className="button button__link button__default" href={`tel:${phone}`}>
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
            <div className="card margin-small">
              <button
                disabled={this.isReportUnsafeDriverButtonDisabled()}
                onClick={this.handleReportUnsafeDriver}
                className="button button__block flex flex-middle flex-space-between padding-small"
                data-test-id="ordering.need-help.report-driver-btn"
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

MerchantInfo.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  order: PropTypes.object,
  orderStatus: PropTypes.string,
  receiptNumber: PropTypes.string,
  loadOrder: PropTypes.func,
  isUseStorehubLogistics: PropTypes.bool,
};

MerchantInfo.defaultProps = {
  order: {},
  orderStatus: null,
  receiptNumber: null,
  loadOrder: () => {},
  isUseStorehubLogistics: false,
};

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
      loadOrder: loadOrderThunk,
    }
  )
)(MerchantInfo);
