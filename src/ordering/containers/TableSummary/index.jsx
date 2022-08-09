import React from 'react';
import qs from 'qs';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Utils from '../../../utils/utils';
import { getLocaleTimeTo24hour } from '../../../utils/time-lib';
import Constants from '../../../utils/constants';
import logger from '../../../utils/monitoring/logger';
import { getUserIsLogin, getBusinessInfo, getShippingType, getBusinessUTCOffset } from '../../redux/modules/app';
import { actions as resetCartSubmissionActions } from '../../redux/cart/index';
import {
  loadOrders as loadOrdersThunk,
  queryOrdersAndStatus as queryOrdersAndStatusThunk,
  clearQueryOrdersAndStatus as clearQueryOrdersAndStatusThunk,
  gotoPayment as gotoPaymentThunk,
} from './redux/thunks';
import {
  removePromo as removePromoThunk,
  removeVoucherPayLater as removeVoucherPayLaterThunk,
} from '../Promotion/redux/common/thunks';
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
  getThankYouPageUrl,
  getOrderServiceChargeRate,
  getOrderBillingPromoIfExist,
  getOrderPromoDiscount,
  getOrderPromotionCode,
  getVoucherBillingIfExist,
  getOrderVoucherCode,
  getOrderVoucherDiscount,
  getPromoOrVoucherExist,
  getShouldShowRedirectLoader,
  getShouldShowPayNowButton,
} from './redux/selectors';
import HybridHeader from '../../../components/HybridHeader';
import CurrencyNumber from '../../components/CurrencyNumber';
import { alert } from '../../../common/feedback';
import Image from '../../../components/Image';
import { IconChecked, IconError, IconClose, IconLocalOffer } from '../../../components/Icons';
import Billing from '../../components/Billing';
import RedirectPageLoader from '../../components/RedirectPageLoader';
import './TableSummary.scss';

const { DELIVERY_METHOD } = Constants;

export class TableSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cartContainerHeight: '100%',
    };
  }

  async componentDidMount() {
    const { t, history, queryOrdersAndStatus } = this.props;
    const receiptNumber = Utils.getQueryString('receiptNumber');
    const emptyString = ['null', 'undefined', ''];

    window.scrollTo(0, 0);
    this.setCartContainerHeight();

    if (receiptNumber && !emptyString.includes(receiptNumber)) {
      await queryOrdersAndStatus(receiptNumber);
    } else {
      logger.error('ordering.tableSummaryInitialize.error', {
        message: 'receiptNumber is missing',
      });

      alert(t('ReceiptNumberInValidDescription'), {
        title: t('ReceiptNumberInValidTitle'),
        closeButtonContent: t('ReturnToCart'),
        onClose: () =>
          history.push({
            pathname: Constants.ROUTER_PATHS.ORDERING_CART,
            search: window.location.search,
          }),
      });
    }
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

  getCorrectCode(code) {
    const SHOW_LENGTH = 5;
    // show like "Promo..."
    if (code) {
      if (code.length > SHOW_LENGTH) {
        return `${code.substring(0, SHOW_LENGTH)}...`;
      }
      return code;
    }
    return '';
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

  handleDismissPromotion = async () => {
    const { removePromo, loadOrders, removeVoucherPayLater, orderBillingPromo } = this.props;

    const receiptNumber = Utils.getQueryString('receiptNumber');

    orderBillingPromo ? await removePromo() : await removeVoucherPayLater();

    await loadOrders(receiptNumber);
  };

  handleGotoPromotion = () => {
    const { history, userIsLogin } = this.props;

    if (userIsLogin) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_PROMOTION,
        search: window.location.search,
        state: { shouldGoBack: true },
      });
    } else {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
        state: { shouldGoBack: true },
      });
    }
  };

  handleClickPayButton = () => {
    const { gotoPayment } = this.props;
    gotoPayment();
  };

  showShortPromoCode() {
    const { orderPromotionCode, orderVoucherCode } = this.props;

    if (orderPromotionCode) {
      return this.getCorrectCode(orderPromotionCode);
    }
    return this.getCorrectCode(orderVoucherCode);
  }

  orderPromoType() {
    const { orderBillingPromo, voucherBilling } = this.props;
    const { PROMO_TYPE } = Constants;

    if (orderBillingPromo) {
      return PROMO_TYPE.PROMOTION_FOR_PAY_LATER;
    }

    if (voucherBilling) {
      return PROMO_TYPE.VOUCHER_FOR_PAY_LATER;
    }

    return '';
  }

  renderPromotionItem() {
    const { t, oderPromoDiscount, orderVoucherDiscount, promoOrVoucherExist } = this.props;

    return (
      <li className="flex flex-middle flex-space-between border__top-divider border__bottom-divider">
        {promoOrVoucherExist ? (
          <>
            <div className="table-summary__promotion-content flex flex-middle flex-space-between padding-left-right-small text-weight-bolder text-omit__single-line">
              <IconLocalOffer className="icon icon__small icon__primary text-middle flex__shrink-fixed" />
              <span className="margin-left-right-smaller text-size-big text-weight-bolder text-omit__single-line">
                {t(this.orderPromoType())} ({this.showShortPromoCode()})
              </span>
              <button
                onClick={this.handleDismissPromotion}
                className="button flex__shrink-fixed"
                data-heap-name="ordering.cart.dismiss-promo"
              >
                <IconClose className="icon icon__small" />
              </button>
            </div>
            <div className="padding-top-bottom-small padding-left-right-normal text-weight-bolder flex__shrink-fixed">
              -{' '}
              <CurrencyNumber
                className="text-size-big text-weight-bolder"
                money={oderPromoDiscount || orderVoucherDiscount}
              />
            </div>
          </>
        ) : (
          <button
            className="table-summary__button-acquisition button button__block text-left padding-top-bottom-smaller padding-left-right-normal"
            onClick={this.handleGotoPromotion}
            data-heap-name="ordering.cart.add-promo"
          >
            <IconLocalOffer className="icon icon__small icon__primary text-middle flex__shrink-fixed" />
            <span className="margin-left-right-small text-size-big text-middle">{t('AddPromoCode')}</span>
          </button>
        )}
      </li>
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
                {subOrderItems.map(({ id, productInfo, displayPrice, quantity, comments: itemComments }) => (
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
                        {itemComments ? (
                          <p className="table-summary__comments padding-top-bottom-smaller text-size-small text-line-height-higher">
                            {itemComments}
                          </p>
                        ) : null}
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

  render() {
    const {
      t,
      history,
      userIsLogin,
      businessInfo,
      shippingType,
      tax,
      serviceCharge,
      serviceChargeRate,
      subtotal,
      total,
      cashback,
      shippingFee,
      orderPlacedStatus,
      orderPendingPaymentStatus,
      shouldShowRedirectLoader,
      shouldShowPayNowButton,
    } = this.props;
    const { cartContainerHeight } = this.state;

    if (shouldShowRedirectLoader) {
      return <RedirectPageLoader />;
    }

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
            serviceChargeRate={serviceChargeRate}
            subtotal={subtotal}
            total={total}
            creditsBalance={cashback}
            shippingFee={shippingFee}
            businessInfo={businessInfo}
            isDeliveryType={shippingType === DELIVERY_METHOD.DELIVERY}
            isLogin={userIsLogin}
            history={history}
            orderPendingPaymentStatus={orderPendingPaymentStatus}
          >
            {this.renderPromotionItem()}
          </Billing>
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
            onClick={this.handleClickPayButton}
          >
            {shouldShowPayNowButton ? t('PayNow') : t('SelectPaymentMethod')}
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
  serviceChargeRate: PropTypes.number,
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
  queryOrdersAndStatus: PropTypes.func,
  clearQueryOrdersAndStatus: PropTypes.func,
  thankYouPageUrl: PropTypes.string,
  resetCartSubmission: PropTypes.func,
  orderBillingPromo: PropTypes.number,
  loadOrders: PropTypes.func,
  removePromo: PropTypes.func,
  oderPromoDiscount: PropTypes.number,
  orderPromotionCode: PropTypes.string,
  removeVoucherPayLater: PropTypes.func,
  voucherBilling: PropTypes.number,
  orderVoucherCode: PropTypes.string,
  orderVoucherDiscount: PropTypes.number,
  promoOrVoucherExist: PropTypes.bool,
  gotoPayment: PropTypes.func,
  shouldShowRedirectLoader: PropTypes.bool,
  shouldShowPayNowButton: PropTypes.bool,
};

TableSummary.defaultProps = {
  orderPlacedStatus: false,
  orderPendingPaymentStatus: false,
  orderNumber: null,
  tableNumber: null,
  tax: 0,
  serviceCharge: 0,
  serviceChargeRate: 0,
  subtotal: 0,
  total: 0,
  cashback: 0,
  shippingFee: 0,
  subOrdersMapping: {},
  userIsLogin: false,
  businessInfo: {},
  businessUTCOffset: 480,
  shippingType: null,
  queryOrdersAndStatus: () => {},
  clearQueryOrdersAndStatus: () => {},
  resetCartSubmission: () => {},
  thankYouPageUrl: '',
  orderBillingPromo: 0,
  loadOrders: () => {},
  removePromo: () => {},
  oderPromoDiscount: 0,
  orderPromotionCode: '',
  removeVoucherPayLater: () => {},
  voucherBilling: 0,
  orderVoucherCode: '',
  orderVoucherDiscount: 0,
  promoOrVoucherExist: false,
  gotoPayment: () => {},
  shouldShowRedirectLoader: false,
  shouldShowPayNowButton: false,
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
      serviceChargeRate: getOrderServiceChargeRate(state),
      subtotal: getOrderSubtotal(state),
      total: getOrderTotal(state),
      cashback: getOrderCashback(state),
      shippingFee: getOrderShippingFee(state),
      subOrdersMapping: getSubOrdersMapping(state),
      businessUTCOffset: getBusinessUTCOffset(state),
      userIsLogin: getUserIsLogin(state),
      businessInfo: getBusinessInfo(state),
      shippingType: getShippingType(state),
      orderBillingPromo: getOrderBillingPromoIfExist(state),
      oderPromoDiscount: getOrderPromoDiscount(state),
      orderPromotionCode: getOrderPromotionCode(state),
      voucherBilling: getVoucherBillingIfExist(state),
      orderVoucherCode: getOrderVoucherCode(state),
      orderVoucherDiscount: getOrderVoucherDiscount(state),
      promoOrVoucherExist: getPromoOrVoucherExist(state),
      shouldShowRedirectLoader: getShouldShowRedirectLoader(state),
      shouldShowPayNowButton: getShouldShowPayNowButton(state),
    }),

    {
      queryOrdersAndStatus: queryOrdersAndStatusThunk,
      clearQueryOrdersAndStatus: clearQueryOrdersAndStatusThunk,
      resetCartSubmission: resetCartSubmissionActions.resetCartSubmission,
      loadOrders: loadOrdersThunk,
      removePromo: removePromoThunk,
      removeVoucherPayLater: removeVoucherPayLaterThunk,
      gotoPayment: gotoPaymentThunk,
    }
  )
)(TableSummary);
