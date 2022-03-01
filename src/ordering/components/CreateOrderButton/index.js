import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import qs from 'qs';
import Utils from '../../../utils/utils';
import {
  getRequestInfo,
  getError,
  getUser,
  getCartBilling,
  getHasLoginGuardPassed,
  getIsCoreBusinessAPIFulfilled,
} from '../../redux/modules/app';
import { createOrder, gotoPayment } from '../../containers/payments/redux/common/thunks';
import withDataAttributes from '../../../components/withDataAttributes';
import PageProcessingLoader from '../../components/PageProcessingLoader';
import Constants from '../../../utils/constants';
import loggly from '../../../utils/monitoring/loggly';
import { fetchOrder } from '../../../utils/api-request';
import i18next from 'i18next';
import { alert } from '../../../common/feedback/';

const { ROUTER_PATHS, REFERRER_SOURCE_TYPES, PAYMENT_PROVIDERS, ORDER_STATUS } = Constants;

class CreateOrderButton extends React.Component {
  componentDidMount = async () => {
    if (this.shouldAskUserLogin()) {
      this.gotoLoginPage();
    }
  };

  componentDidUpdate = prevProps => {
    const { user: prevUser } = prevProps;
    const { user: currentUser } = this.props;
    const { isFetching: isPrevFetching } = prevUser || {};
    const { isFetching: isCurrentFetching } = currentUser || {};

    if (
      isPrevFetching !== isCurrentFetching ||
      prevProps.isCoreBusinessFulfilled !== this.props.isCoreBusinessFulfilled
    ) {
      if (this.shouldAskUserLogin()) {
        this.gotoLoginPage();
      }
    }
  };

  shouldAskUserLogin = () => {
    const { user, history, hasLoginGuardPassed, isCoreBusinessFulfilled } = this.props;
    const { pathname } = history.location;
    const { isFetching, isLogin } = user || {};

    if (pathname === ROUTER_PATHS.ORDERING_CART) {
      // Cart page do not require login
      return false;
    }

    if (!isCoreBusinessFulfilled || isFetching) {
      // the request of core business and ping API isn't fulfilled
      return false;
    }

    if (pathname === ROUTER_PATHS.ORDERING_CUSTOMER_INFO) {
      // Customer Info Page has login required
      return !isLogin;
    }

    return !hasLoginGuardPassed;
  };

  gotoLoginPage = () => {
    const { history } = this.props;
    history.push({
      pathname: ROUTER_PATHS.ORDERING_LOGIN,
      search: window.location.search,
      state: { shouldGoBack: true },
    });
  };

  handleCreateOrderSafety = async () => {
    try {
      await this.handleCreateOrder();
    } catch (error) {
      console.error(error);
      this.props.afterCreateOrder && this.props.afterCreateOrder();
    }
  };

  gotoThankyouPage = (orderId, type) => {
    const thankYouPagePath = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.THANK_YOU}`;
    const queryString = qs.stringify(
      {
        h: Utils.getStoreHashCode(),
        type,
        receiptNumber: orderId,
      },
      {
        addQueryPrefix: true,
      }
    );

    window.location.href = `${thankYouPagePath}${queryString}`;
  };

  handleCreateOrder = async () => {
    const {
      history,
      createOrder,
      requestInfo,
      cartBilling,
      afterCreateOrder,
      beforeCreateOrder,
      hasLoginGuardPassed,
      paymentName,
      gotoPayment,
      orderId: createdOrderId,
      total: createdOrderTotal,
    } = this.props;
    const { tableId /*storeId*/ } = requestInfo;
    const { totalCashback } = cartBilling || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    let orderId = createdOrderId,
      total = createdOrderTotal;

    if (beforeCreateOrder) {
      await beforeCreateOrder();
    }

    // for Pay at counter it will fully handle order creation logic by itself in beforeCreateOrder
    if (paymentName === PAYMENT_PROVIDERS.SH_OFFLINE_PAYMENT) {
      return;
    }

    const { validCreateOrder } = this.props;

    const isValidToCreateOrder = () => {
      if (!validCreateOrder) {
        return false;
      }

      if (!hasLoginGuardPassed) {
        return false;
      }

      return true;
    };

    if (!isValidToCreateOrder()) {
      afterCreateOrder && afterCreateOrder();
      return;
    }

    // For pay later order, if order has already been paid, then let user goto Thankyou page directly
    if (orderId) {
      const order = await fetchOrder(orderId);
      console.log(order.status);
      if (
        ![
          ORDER_STATUS.CREATED,
          ORDER_STATUS.PENDING_PAYMENT,
          ORDER_STATUS.PENDING_VERIFICATION,
          ORDER_STATUS.FAILED,
          ORDER_STATUS.CANCELLED,
          ORDER_STATUS.PAYMENT_CANCELLED,
        ].includes(order.status)
      ) {
        loggly.log('ordering.order-has-paid', { order });

        alert(i18next.t('OrderHasPaidAlertDescription'), {
          closeButtonContent: i18next.t('Continue'),
          title: i18next.t('OrderHasPaidAlertTitle'),
          onClose: () => {
            this.gotoThankyouPage(orderId, type);
          },
        });
        return;
      }
    }

    if (!orderId) {
      window.newrelic?.addPageAction('ordering.common.create-order-btn.create-order-start', {
        paymentName: paymentName || 'N/A',
      });

      const createOrderResult = await createOrder({ cashback: totalCashback, shippingType: type });
      window.newrelic?.addPageAction('ordering.common.create-order-btn.create-order-done', {
        paymentName: paymentName || 'N/A',
      });

      const { order, redirectUrl: thankYouPageUrl } = createOrderResult || {};
      if (order) {
        orderId = order.orderId;
        total = order.total;
      }

      loggly.log('ordering.order-created', { orderId });

      if (orderId) {
        Utils.removeSessionVariable('additionalComments');
        Utils.removeSessionVariable('deliveryComments');
      }

      if (thankYouPageUrl) {
        Utils.setCookieVariable('__ty_source', REFERRER_SOURCE_TYPES.CASHBACK);
        loggly.log('ordering.to-thank-you', { orderId });
        window.location = `${thankYouPageUrl}${tableId ? `&tableId=${tableId}` : ''}${type ? `&type=${type}` : ''}`;

        return;
      }
    }

    if (afterCreateOrder) {
      afterCreateOrder(orderId);
    }

    if (orderId) {
      // NOTE: We MUST access paymentExtraData here instead of the beginning of the function, because the value of
      // paymentExtraData could be changed after beforeCreateOrder is executed.
      await gotoPayment({ orderId, total }, this.props.paymentExtraData);
    }
  };

  render() {
    const { children, className, buttonType, disabled, dataAttributes, loaderText, processing } = this.props;
    const classList = ['button button__fill button__block text-weight-bolder'];

    if (className) {
      classList.push(className);
    }

    return (
      <>
        <button
          className={classList.join(' ')}
          type={buttonType}
          disabled={disabled}
          onClick={this.handleCreateOrderSafety}
          {...dataAttributes}
        >
          {children}
        </button>
        <PageProcessingLoader show={processing} loaderText={loaderText} />
      </>
    );
  }
}

CreateOrderButton.displayName = 'CreateOrderButton';

CreateOrderButton.propTypes = {
  user: PropTypes.object,
  history: PropTypes.object,
  className: PropTypes.string,
  buttonType: PropTypes.string,
  validCreateOrder: PropTypes.bool,
  sentOtp: PropTypes.bool,
  disabled: PropTypes.bool,
  beforeCreateOrder: PropTypes.func,
  afterCreateOrder: PropTypes.func,
  paymentName: PropTypes.string,
  paymentExtraData: PropTypes.object,
  processing: PropTypes.bool,
  loaderText: PropTypes.string,
  cartBilling: PropTypes.object,
  getHasLoginGuardPassed: PropTypes.bool,
};

CreateOrderButton.defaultProps = {
  buttonType: 'button',
  validCreateOrder: true,
  isPromotionValid: true,
  disabled: true,
  sentOtp: false,
  processing: false,
  cartBilling: {},
  getHasLoginGuardPassed: false,
  beforeCreateOrder: () => {},
  afterCreateOrder: () => {},
};

export default compose(
  withDataAttributes,
  connect(
    state => {
      return {
        user: getUser(state),
        error: getError(state),
        requestInfo: getRequestInfo(state),
        cartBilling: getCartBilling(state),
        hasLoginGuardPassed: getHasLoginGuardPassed(state),
        isCoreBusinessFulfilled: getIsCoreBusinessAPIFulfilled(state),
      };
    },
    {
      createOrder,
      gotoPayment,
    }
  )
)(CreateOrderButton);
