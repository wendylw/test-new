import React from 'react';
import qs from 'qs';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Utils from '../../../utils/utils';
import { getLocaleTimeTo24hour } from '../../../utils/time-lib';
import Constants from '../../../utils/constants';
import { getUserIsLogin, getBusinessInfo, getShippingType, getBusinessUTCOffset } from '../../redux/modules/app';
import { actions } from './redux';
import { actions as resetCartSubmissionActions } from '../../redux/cart/index';
import {
  queryOrdersAndStatus as queryOrdersAndStatusThunk,
  clearQueryOrdersAndStatus as clearQueryOrdersAndStatusThunk,
} from './redux/thunks';
import {
  getOrderPickUpCode,
  getTableNumber,
  getOrderTax,
  getOrderServiceCharge,
  getOrderSubtotal,
  getOrderTotal,
  getOrderCashback,
  getOrderShippingFee,
  getOrderPlacedStatus,
  getOrderPendingPaymentStatus,
  getSubOrdersMapping,
  getOrderSubmissionRequestingStatus,
  getThankYouPageUrl,
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
    const receiptNumber = Utils.getQueryString('receiptNumber');

    window.scrollTo(0, 0);
    this.setCartContainerHeight();

    await queryOrdersAndStatus(receiptNumber);
  }

  componentDidUpdate(prevProps, prevStates) {
    this.setCartContainerHeight(prevStates.cartContainerHeight);

    const { thankYouPageUrl, shippingType } = this.props;

    if (thankYouPageUrl) {
      // Add "type" into thankYouPageUrl query
      const urlObj = new URL(thankYouPageUrl, window.location.origin);
      urlObj.searchParams.set('type', shippingType);

      window.location.href = urlObj.toString();
    }
  }

  async componentWillUnmount() {
    const { clearQueryOrdersAndStatus, resetCartSubmission } = this.props;

    await clearQueryOrdersAndStatus();
    resetCartSubmission();
  }

  goToMenuPage = () => {
    const { history, shippingType } = this.props;
    const hashCode = Utils.getStoreHashCode();
    const search = qs.stringify(
      {
        h: hashCode,
        type: shippingType,
      },
      { addQueryPrefix: true }
    );

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      search,
    });
  };

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

  showUnableBackMenuPageAlert = () => {
    const { t, orderPendingPaymentStatus } = this.props;

    alert(
      <Trans
        t={t}
        i18nKey={orderPendingPaymentStatus ? 'UnableBackMenuAndPendingPaymentDescription' : 'UnableBackMenuDescription'}
        components={{ bold: <strong className="text-size-big" /> }}
      />,
      {
        title: t('UnableBackMenuTitle'),
        closeButtonContent: t('GotIt'),
        className: 'table-summary__back-menu-alert',
      }
    );
  };

  handleHeaderNavFunc = () => {
    const { orderPlacedStatus } = this.props;

    if (orderPlacedStatus) {
      this.goToMenuPage();

      return;
    }

    this.showUnableBackMenuPageAlert();
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
              <li
                key="table-summary-order-number"
                className="flex flex-middle flex-space-between padding-top-bottom-normal"
              >
                <h5 className="text-size-small text-opacity text-capitalize">{t('OrderNumber')}</h5>
                <span className="text-size-small">{orderNumber}</span>
              </li>
            ) : null}
            {tableNumber ? (
              <li
                key="table-summary-table-number"
                className="flex flex-middle flex-space-between padding-top-bottom-normal border__top-divider"
              >
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
            <div key={`sub-order-${subOrderId}`} className="table-summary__sub-order padding-top-bottom-small">
              <div className="text-right padding-left-right-small padding-top-bottom-smaller">
                <span className="margin-small text-opacity">
                  {t('CreatedOrderTime', { submittedTime: localeSubmittedTime })}
                </span>
              </div>
              <ul>
                {subOrderItems.map(({ id, productInfo, displayPrice, quantity }) => (
                  <li
                    key={`product-item-${id}`}
                    className="flex flex-middle flex-space-between padding-left-right-small"
                  >
                    <div className="flex">
                      <div className="table-summary__image-container flex__shrink-fixed margin-small">
                        <Image className="table-summary__image card__image" src={productInfo?.image} alt="" />
                      </div>
                      <div className="padding-small flex flex-column flex-space-between">
                        <span className="table-summary__item-title">{productInfo?.title}</span>
                        <p className="table-summary__item-variations">
                          {(productInfo?.variationTexts || []).join(', ')}
                        </p>
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

              {comments && (
                <div className="border__top-divider margin-top-bottom-small margin-left-right-normal text-opacity">
                  <p className="padding-top-bottom-normal text-line-height-base">{comments}</p>
                </div>
              )}
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
      orderPlacedStatus,
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
          <SubmitOrderConfirm history={history} />
        </div>
        <footer
          ref={ref => {
            this.footerEl = ref;
          }}
          className="footer padding-small flex flex-middle"
        >
          {orderPlacedStatus ? (
            <button
              className="table-summary__outline-button button button__outline button__block flex__grow-1 padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
              onClick={this.goToMenuPage}
            >
              {t('AddItems')}
            </button>
          ) : null}

          <button
            className="button button__fill button__block flex__grow-1 padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
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
  orderSubmissionRequestingStatus: PropTypes.bool,
  queryOrdersAndStatus: PropTypes.func,
  clearQueryOrdersAndStatus: PropTypes.func,
  updateSubmitOrderConfirmDisplay: PropTypes.func,
  thankYouPageUrl: PropTypes.string,
  resetCartSubmission: PropTypes.func,
};

TableSummary.defaultProps = {
  orderPlacedStatus: false,
  orderPendingPaymentStatus: false,
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
  orderSubmissionRequestingStatus: false,
  queryOrdersAndStatus: () => {},
  clearQueryOrdersAndStatus: () => {},
  updateSubmitOrderConfirmDisplay: () => {},
  resetCartSubmission: () => {},
  thankYouPageUrl: '',
};

export default compose(
  withTranslation(['OrderingTableSummary']),
  connect(
    state => ({
      orderPlacedStatus: getOrderPlacedStatus(state),
      orderPendingPaymentStatus: getOrderPendingPaymentStatus(state),
      orderNumber: getOrderPickUpCode(state),
      tableNumber: getTableNumber(state),
      tax: getOrderTax(state),
      thankYouPageUrl: getThankYouPageUrl(state),
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

      orderSubmissionRequestingStatus: getOrderSubmissionRequestingStatus(state),
    }),

    {
      queryOrdersAndStatus: queryOrdersAndStatusThunk,
      clearQueryOrdersAndStatus: clearQueryOrdersAndStatusThunk,
      updateSubmitOrderConfirmDisplay: actions.updateSubmitOrderConfirmDisplay,
      resetCartSubmission: resetCartSubmissionActions.resetCartSubmission,
    }
  )
)(TableSummary);
