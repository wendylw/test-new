import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import qs from 'qs';
import Utils from '../../../utils/utils';
import { getRequestInfo, getError, getUser, getCartBilling, getHasLoginGuardPassed } from '../../redux/modules/app';
import { createOrder, gotoPayment } from '../../containers/payments/redux/common/thunks';
import withDataAttributes from '../../../components/withDataAttributes';
import PageProcessingLoader from '../../components/PageProcessingLoader';
import Constants from '../../../utils/constants';
import loggly from '../../../utils/monitoring/loggly';

const { ROUTER_PATHS } = Constants;

class CreateOrderButton extends React.Component {
  componentDidUpdate = prevProps => {
    const { user: prevUser } = prevProps;
    const { user: currentUser, hasLoginGuardPassed } = this.props;
    const { isFetching: isPrevFetching } = prevUser || {};
    const { isFetching: isCurrentFetching } = currentUser || {};
    const isFetchingJustDone = isPrevFetching && !isCurrentFetching;
    const shouldAskUserLogin = isFetchingJustDone && !hasLoginGuardPassed;

    if (!shouldAskUserLogin) return;
    this.gotoLoginPage();
  };

  gotoLoginPage = () => {
    const { history } = this.props;

    history.push({
      pathname: ROUTER_PATHS.ORDERING_LOGIN,
      search: window.location.search,
    });
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
    } = this.props;
    const { tableId /*storeId*/ } = requestInfo;
    const { totalCashback } = cartBilling || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    let newOrderId;
    let currentOrder;

    if (beforeCreateOrder) {
      await beforeCreateOrder();
    }

    const { validCreateOrder } = this.props;

    if (hasLoginGuardPassed && paymentName !== 'SHOfflinePayment' && validCreateOrder) {
      window.newrelic?.addPageAction('ordering.common.create-order-btn.create-order-start', {
        paymentName: paymentName || 'N/A',
      });

      const createOrderResult = await createOrder({ cashback: totalCashback, shippingType: type });
      window.newrelic?.addPageAction('ordering.common.create-order-btn.create-order-done', {
        paymentName: paymentName || 'N/A',
      });

      const { order, redirectUrl: thankYouPageUrl } = createOrderResult || {};
      currentOrder = order;
      const { orderId } = currentOrder || {};
      loggly.log('ordering.order-created', { orderId });

      newOrderId = orderId;

      if (orderId) {
        Utils.removeSessionVariable('additionalComments');
        Utils.removeSessionVariable('deliveryComments');
      }

      if (thankYouPageUrl) {
        loggly.log('ordering.to-thank-you', { orderId });
        window.location = `${thankYouPageUrl}${tableId ? `&tableId=${tableId}` : ''}${type ? `&type=${type}` : ''}`;

        return;
      }
    }

    if (afterCreateOrder) {
      afterCreateOrder(newOrderId);
    }

    if (currentOrder) {
      // NOTE: We MUST access paymentExtraData here instead of the beginning of the function, because the value of
      // paymentExtraData could be changed after beforeCreateOrder is executed.
      gotoPayment(currentOrder, this.props.paymentExtraData);
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
          onClick={this.handleCreateOrder.bind(this)}
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
      };
    },
    {
      createOrder,
      gotoPayment,
    }
  )
)(CreateOrderButton);
