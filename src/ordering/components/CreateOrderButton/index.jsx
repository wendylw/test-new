import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import qs from 'qs';
import i18next from 'i18next';
import Utils from '../../../utils/utils';
import {
  getRequestInfo,
  getError,
  getUser,
  getCartBilling,
  getHasLoginGuardPassed,
  getIsCoreBusinessAPIFulfilled,
} from '../../redux/modules/app';
import {
  createOrder as createOrderThunk,
  gotoPayment as gotoPaymentThunk,
} from '../../containers/payments/redux/common/thunks';
import PageProcessingLoader from '../PageProcessingLoader';
import Constants, { REFERRER_SOURCE_TYPES } from '../../../utils/constants';
import logger from '../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../utils/monitoring/constants';
import { fetchOrder } from '../../../utils/api-request';
import { alert } from '../../../common/feedback';
import { extractDataAttributes } from '../../../common/utils';

const { ROUTER_PATHS, PAYMENT_PROVIDERS, ORDER_STATUS } = Constants;

class CreateOrderButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingCreatedOrder: false,
    };
  }

  componentDidMount = async () => {
    if (this.shouldAskUserLogin()) {
      this.gotoLoginPage();
    }
  };

  componentDidUpdate = prevProps => {
    const { user: prevUser, isCoreBusinessFulfilled: prevIsCoreBusinessFulfilled } = prevProps;
    const { user: currUser, isCoreBusinessFulfilled: currIsCoreBusinessFulfilled } = this.props;
    const { isFetching: isPrevFetching } = prevUser || {};
    const { isFetching: isCurrentFetching } = currUser || {};

    if (isPrevFetching !== isCurrentFetching || prevIsCoreBusinessFulfilled !== currIsCoreBusinessFulfilled) {
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
      const { paymentName, afterCreateOrder } = this.props;

      logger.error(
        'Ordering_CreateOrderButton_CreateOrderFailed',
        {
          message: error?.message,
          name: paymentName || 'N/A',
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.PAYMENT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.PAYMENT].SUBMIT_ORDER,
          },
          errorCategory: error?.name,
        }
      );

      afterCreateOrder && afterCreateOrder();
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
    const { tableId } = requestInfo;
    const { totalCashback } = cartBilling || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    let orderId = createdOrderId;
    let total = createdOrderTotal;

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

      if (
        [
          ORDER_STATUS.PAID,
          ORDER_STATUS.READY_FOR_DELIVERY,
          ORDER_STATUS.READY_FOR_PICKUP,
          ORDER_STATUS.SHIPPED,
          ORDER_STATUS.ACCEPTED,
          ORDER_STATUS.LOGISTICS_CONFIRMED,
          ORDER_STATUS.CONFIRMED,
          ORDER_STATUS.DELIVERED,
        ].includes(order.status)
      ) {
        logger.log('Ordering_CreateOrderButton_OrderHasPaid', { id: orderId });

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
      this.setState({ isLoadingCreatedOrder: true });
      const createOrderResult = await createOrder({ cashback: totalCashback, shippingType: type });

      const { order, redirectUrl: thankYouPageUrl } = createOrderResult || {};
      if (order) {
        orderId = order.orderId;
        total = order.total;
      }

      logger.log('Ordering_CreateOrderButton_OrderHasCreated', { id: orderId });

      if (orderId) {
        Utils.removeSessionVariable('additionalComments');
        Utils.removeSessionVariable('deliveryComments');
      }

      if (thankYouPageUrl) {
        Utils.setCookieVariable('__ty_source', REFERRER_SOURCE_TYPES.CASHBACK);
        logger.log('Ordering_CreateOrderButton_GoToThankYouPage', { id: orderId });
        window.location = `${thankYouPageUrl}${tableId ? `&tableId=${tableId}` : ''}${type ? `&type=${type}` : ''}`;

        return;
      }
    }

    this.setState({ isLoadingCreatedOrder: false });

    if (afterCreateOrder) {
      afterCreateOrder(orderId);
    }

    if (orderId) {
      const { paymentExtraData } = this.props;
      // NOTE: We MUST access paymentExtraData here instead of the beginning of the function, because the value of
      // paymentExtraData could be changed after beforeCreateOrder is executed.
      await gotoPayment({ orderId, total }, paymentExtraData);
    }
  };

  render() {
    const { children, className, buttonType, disabled, loaderText, processing } = this.props;
    const { isLoadingCreatedOrder } = this.state;
    const classList = ['button button__fill button__block text-weight-bolder'];

    if (className) {
      classList.push(className);
    }

    return (
      <>
        <button
          className={classList.join(' ')}
          type={buttonType}
          disabled={disabled || isLoadingCreatedOrder}
          onClick={this.handleCreateOrderSafety}
          data-test-id="ordering.create-order-button.continue-btn"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...extractDataAttributes(this.props)}
        >
          {isLoadingCreatedOrder ? loaderText : children}
        </button>
        <PageProcessingLoader show={processing} loaderText={loaderText} />
      </>
    );
  }
}

CreateOrderButton.displayName = 'CreateOrderButton';

CreateOrderButton.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  user: PropTypes.object,
  paymentExtraData: PropTypes.object,
  /* eslint-enable */
  requestInfo: PropTypes.shape({
    tableId: PropTypes.string,
  }),
  cartBilling: PropTypes.shape({
    totalCashback: PropTypes.number,
  }),
  children: PropTypes.node,
  total: PropTypes.number,
  orderId: PropTypes.string,
  className: PropTypes.string,
  buttonType: PropTypes.string,
  validCreateOrder: PropTypes.bool,
  sentOtp: PropTypes.bool,
  disabled: PropTypes.bool,
  createOrder: PropTypes.func,
  gotoPayment: PropTypes.func,
  beforeCreateOrder: PropTypes.func,
  afterCreateOrder: PropTypes.func,
  paymentName: PropTypes.string,
  processing: PropTypes.bool,
  loaderText: PropTypes.string,
  hasLoginGuardPassed: PropTypes.bool,
  isCoreBusinessFulfilled: PropTypes.bool,
  getHasLoginGuardPassed: PropTypes.bool,
};

CreateOrderButton.defaultProps = {
  user: {},
  requestInfo: {
    tableId: '',
  },
  cartBilling: {
    totalCashback: 0,
  },
  paymentExtraData: {},
  buttonType: 'button',
  total: null,
  orderId: null,
  children: null,
  className: '',
  loaderText: '',
  paymentName: '',
  validCreateOrder: true,
  disabled: true,
  sentOtp: false,
  processing: false,
  hasLoginGuardPassed: false,
  isCoreBusinessFulfilled: false,
  getHasLoginGuardPassed: false,
  createOrder: () => {},
  gotoPayment: () => {},
  beforeCreateOrder: () => {},
  afterCreateOrder: () => {},
};

export default compose(
  connect(
    state => ({
      user: getUser(state),
      error: getError(state),
      requestInfo: getRequestInfo(state),
      cartBilling: getCartBilling(state),
      hasLoginGuardPassed: getHasLoginGuardPassed(state),
      isCoreBusinessFulfilled: getIsCoreBusinessAPIFulfilled(state),
    }),
    {
      createOrder: createOrderThunk,
      gotoPayment: gotoPaymentThunk,
    }
  )
)(CreateOrderButton);
