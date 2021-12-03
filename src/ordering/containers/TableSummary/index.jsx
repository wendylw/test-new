import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Utils from '../../../utils/utils';
import { getLocaleTimeTo24hour } from '../../../utils/time-lib';
import Constants from '../../../utils/constants';
import * as NativeMethods from '../../../utils/native-methods';
import { getUserIsLogin, getBusinessInfo, getShippingType, getBusinessUTCOffset } from '../../redux/modules/app';
import { actions } from './redux';
import {
  queryOrdersAndStatus as queryOrdersAndStatusThunk,
  clearQueryOrdersAndStatus as clearQueryOrdersAndStatusThunk,
} from './redux/thunks';
import {
  getOrderReceiptNumber,
  getTableNumber,
  getOrderTax,
  getOrderServiceCharge,
  getOrderSubtotal,
  getOrderTotal,
  getOrderCashback,
  getOrderShippingFee,
  getOrderPlacedStatus,
  getOrderPendingPaymentStatus,
  getOrderCompletedStatus,
  getSubOrdersMapping,
  getThankYouPageUrl,
  getOrderSubmissionRequestingStatus,
} from './redux/selectors';
import HybridHeader from '../../../components/HybridHeader';
import CurrencyNumber from '../../components/CurrencyNumber';
import { alert } from '../../../common/feedback';
import Image from '../../../components/Image';
import { IconChecked, IconError } from '../../../components/Icons';
import Billing from '../../components/Billing';
import SubmitOrderConfirm from './components/SubmitOrderConfirm';
import './TableSummary.scss';

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;

export class TableSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cartContainerHeight: '100%',
    };
  }

  async componentDidMount() {
    const { queryOrdersAndStatus } = this.props;

    window.scrollTo(0, 0);
    this.setCartContainerHeight();

    await queryOrdersAndStatus();
  }

  componentDidUpdate(prevProps, prevStates) {
    this.setCartContainerHeight(prevStates.cartContainerHeight);

    const { orderCompletedStatus, thankYouPageUrl } = this.props;

    if (orderCompletedStatus && thankYouPageUrl) {
      window.location.href = thankYouPageUrl;
    }
  }

  async componentWillUnmount() {
    const { clearQueryOrdersAndStatus } = this.props;

    await clearQueryOrdersAndStatus();
  }

  setCartContainerHeight = preContainerHeight => {
    const containerHeight = Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl],
    });

    if (preContainerHeight !== containerHeight) {
      this.setState({
        cartContainerHeight: containerHeight,
      });
    }
  };

  handleHeaderNavFunc = () => {
    const { t } = this.props;
    const isWebview = Utils.isWebview();

    if (isWebview) {
      NativeMethods.closeWebView();

      return;
    }

    alert(
      <Trans t={t} i18nKey="UnableBackMenuDescription" components={{ bold: <strong className="text-size-big" /> }} />,
      {
        title: t('UnableBackMenuTitle'),
        closeButtonContent: t('GotIt'),
        className: 'table-summary__back-menu-alert',
      }
    );
  };

  handleConfirmOrderSubmissionOrGotoPaymentPage = () => {
    const { history, orderPlacedStatus, orderPendingPaymentStatus, updateSubmitOrderConfirmDisplay } = this.props;

    if (orderPlacedStatus) {
      updateSubmitOrderConfirmDisplay(true);

      return;
    }

    if (orderPendingPaymentStatus) {
      history.push({
        pathname: ROUTER_PATHS.ORDERING_PAYMENT,
        search: window.location.search,
      });

      return;
    }

    // TODO: May be need complete other status behavior
    console.error('order status is not created or pending payment');
  };

  getOrderStatusOptionsEl = () => {
    const { t, orderPlacedStatus, orderPendingPaymentStatus } = this.props;
    let options = null;

    if (orderPlacedStatus) {
      options = {
        className: 'table-summary__base-info-status--created',
        icon: <IconChecked className="icon icon__success padding-small" />,
        title: <span className="margin-left-right-smaller text-size-big text-capitalize">{t('OrderPlaced')}</span>,
      };
    } else if (orderPendingPaymentStatus) {
      options = {
        className: 'table-summary__base-info-status--locked',
        icon: <IconError className="icon icon__primary padding-small" />,
        title: (
          <span className="margin-left-right-smaller text-size-big text-capitalize theme-color">
            {t('PendingPayment')}
          </span>
        ),
      };
    }

    return (
      options && (
        <div className={`${options.className} flex flex-middle padding-small`}>
          {options.icon}
          {options.title}
        </div>
      )
    );
  };

  renderBaseInfo() {
    const { t, orderNumber, tableNumber } = this.props;

    return (
      <div className="table-summary__base-info">
        {this.getOrderStatusOptionsEl()}
        <div className="padding-left-right-normal padding-top-bottom-small">
          <ul className="table-summary__base-info-list">
            {orderNumber ? (
              <li className="flex flex-middle flex-space-between padding-top-bottom-normal">
                <h5 className="text-size-small text-opacity text-capitalize">{t('OrderNumber')}</h5>
                <span className="text-size-small">{orderNumber}</span>
              </li>
            ) : null}
            {tableNumber ? (
              <li className="flex flex-middle flex-space-between padding-top-bottom-normal border__top-divider">
                <h5 className="text-size-small text-opacity text-capitalize">{t('TableNumber')}</h5>
                <span className="text-size-small">{tableNumber}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    );
  }

  renderSubOrders() {
    const { t, subOrdersMapping, businessUTCOffset } = this.props;
    const subOrderIds = Object.keys(subOrdersMapping);

    return (
      <>
        {subOrderIds.map(subOrderId => {
          const { submittedTime, items: subOrderItems, comments } = subOrdersMapping[subOrderId];
          const localeSubmittedTime = getLocaleTimeTo24hour(submittedTime, businessUTCOffset);

          return (
            <div className="table-summary__sub-order padding-top-bottom-small">
              <div className="text-right padding-small">
                <span className="margin-small text-opacity">
                  {t('CreatedOrderTime', { submittedTime: localeSubmittedTime })}
                </span>
              </div>
              <ul>
                {subOrderItems.map(({ productInfo, displayPrice, quantity }) => (
                  <li key="" className="flex flex-middle flex-space-between padding-left-right-small">
                    <div className="flex">
                      <div className="table-summary__image-container flex__shrink-fixed margin-small">
                        <Image className="table-summary__image card__image" src={productInfo?.image} alt="" />
                      </div>
                      <div className="padding-small flex flex-column flex-space-between">
                        <span className="table-summary__item-title">{productInfo?.title}</span>
                        <p className="table-summary__item-variations">{productInfo?.variationTexts.join(', ')}</p>
                        <CurrencyNumber
                          className="padding-top-bottom-smaller flex__shrink-fixed text-opacity"
                          money={displayPrice * quantity}
                          numberOnly
                        />
                      </div>
                    </div>
                    <span className="padding-top-bottom-small flex__shrink-fixed margin-small text-opacity">
                      x {quantity}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border__top-divider margin-top-bottom-small margin-left-right-normal text-opacity">
                <p className="padding-top-bottom-normal text-line-height-base">{comments}</p>
              </div>
            </div>
          );
        })}
      </>
    );
  }

  render() {
    const {
      t,
      history,
      userIsLogin,
      businessInfo,
      shippingType,
      tax,
      serviceCharge,
      subtotal,
      total,
      cashback,
      shippingFee,
      orderPendingPaymentStatus,
      orderSubmissionRequestingStatus,
    } = this.props;
    const { cartContainerHeight } = this.state;

    return (
      <section
        className="table-summary flex flex-column"
        data-heap-name="ordering.order-status.table-summary.container"
      >
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          titleAlignment="center"
          className="flex-middle"
          contentClassName="table-summary__header-content flex-middle flex-center flex-space-between text-capitalize"
          data-heap-name="ordering.need-help.header"
          isPage
          title={t('TableSummary')}
          navFunc={this.handleHeaderNavFunc}
        />

        <div
          className="table-summary__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: cartContainerHeight,
          }}
        >
          {this.renderBaseInfo()}
          {this.renderSubOrders()}
          <Billing
            billingRef={ref => {
              this.billingEl = ref;
            }}
            className="table-summary__billing-container"
            tax={tax}
            serviceCharge={serviceCharge}
            subtotal={subtotal}
            total={total}
            creditsBalance={cashback}
            shippingFee={shippingFee}
            businessInfo={{ ...businessInfo, enableCashback: false }}
            isDeliveryType={shippingType === DELIVERY_METHOD.DELIVERY}
            isLogin={userIsLogin}
            history={history}
          />
          <SubmitOrderConfirm />
        </div>
        <footer
          ref={ref => {
            this.footerEl = ref;
          }}
          className="footer padding-small flex flex-middle"
        >
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-testid="pay"
            data-heap-name="ordering.order-status.table-summary.pay-btn"
            onClick={this.handleConfirmOrderSubmissionOrGotoPaymentPage}
            disabled={orderSubmissionRequestingStatus}
          >
            {orderPendingPaymentStatus ? t('SelectPaymentMethod') : t('PayNow')}
          </button>
        </footer>
      </section>
    );
  }
}

TableSummary.displayName = 'TableSummary';

TableSummary.propTypes = {
  orderPlacedStatus: PropTypes.bool,
  orderPendingPaymentStatus: PropTypes.bool,
  orderCompletedStatus: PropTypes.bool,
  orderNumber: PropTypes.string,
  tableNumber: PropTypes.string,
  tax: PropTypes.number,
  serviceCharge: PropTypes.number,
  subtotal: PropTypes.number,
  total: PropTypes.number,
  cashback: PropTypes.number,
  shippingFee: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  subOrdersMapping: PropTypes.object,
  userIsLogin: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  businessInfo: PropTypes.object,
  businessUTCOffset: PropTypes.number,
  shippingType: PropTypes.string,
  thankYouPageUrl: PropTypes.string,
  orderSubmissionRequestingStatus: PropTypes.bool,
  queryOrdersAndStatus: PropTypes.func,
  clearQueryOrdersAndStatus: PropTypes.func,
  updateSubmitOrderConfirmDisplay: PropTypes.func,
};

TableSummary.defaultProps = {
  orderPlacedStatus: false,
  orderPendingPaymentStatus: false,
  orderCompletedStatus: false,
  orderNumber: null,
  tableNumber: null,
  tax: 0,
  serviceCharge: 0,
  subtotal: 0,
  total: 0,
  cashback: 0,
  shippingFee: 0,
  subOrdersMapping: {},
  userIsLogin: false,
  businessInfo: {},
  businessUTCOffset: 480,
  shippingType: null,
  thankYouPageUrl: null,
  orderSubmissionRequestingStatus: false,
  queryOrdersAndStatus: () => {},
  clearQueryOrdersAndStatus: () => {},
  updateSubmitOrderConfirmDisplay: () => {},
};

export default compose(
  withTranslation(['OrderingTableSummary']),
  connect(
    state => ({
      orderPlacedStatus: getOrderPlacedStatus(state),
      orderPendingPaymentStatus: getOrderPendingPaymentStatus(state),
      orderCompletedStatus: getOrderCompletedStatus(state),
      orderReceiptNumber: getOrderReceiptNumber(state),
      tableNumber: getTableNumber(state),
      tax: getOrderTax(state),
      serviceCharge: getOrderServiceCharge(state),
      subtotal: getOrderSubtotal(state),
      total: getOrderTotal(state),
      cashback: getOrderCashback(state),
      shippingFee: getOrderShippingFee(state),
      subOrdersMapping: getSubOrdersMapping(state),
      businessUTCOffset: getBusinessUTCOffset(state),
      userIsLogin: getUserIsLogin(state),
      businessInfo: getBusinessInfo(state),
      shippingType: getShippingType(state),
      thankYouPageUrl: getThankYouPageUrl(state),
      orderSubmissionRequestingStatus: getOrderSubmissionRequestingStatus(state),
    }),
    {
      queryOrdersAndStatus: queryOrdersAndStatusThunk,
      clearQueryOrdersAndStatus: clearQueryOrdersAndStatusThunk,
      updateSubmitOrderConfirmDisplay: actions.updateSubmitOrderConfirmDisplay,
    }
  )
)(TableSummary);
