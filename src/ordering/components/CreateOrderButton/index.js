import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import qs from 'qs';
import Utils from '../../../utils/utils';
import { getUser, getRequestInfo, getError, getCartBilling } from '../../redux/modules/app';
import { createOrder, gotoPayment } from '../../containers/payments/redux/common/thunks';
import withDataAttributes from '../../../components/withDataAttributes';
import PageProcessingLoader from '../../components/PageProcessingLoader';
import Constants from '../../../utils/constants';
import loggly from '../../../utils/monitoring/loggly';

const { ROUTER_PATHS } = Constants;

class CreateOrderButton extends React.Component {
  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isFetching } = user || {};

    if (!Utils.isDigitalType()) {
      if (isFetching && !this.props.user.isLogin && isFetching !== this.props.user.isFetching) {
        this.visitLoginPage();
      }
    }
  }

  visitLoginPage = () => {
    const { history, user } = this.props;
    const { isLogin } = user || {};

    if (!isLogin) {
      history.push({
        pathname: ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
      });
    }
  };

  handleCreateOrder = async () => {
    const {
      history,
      createOrder,
      user,
      requestInfo,
      cartBilling,
      afterCreateOrder,
      beforeCreateOrder,
      paymentName,
      gotoPayment,
    } = this.props;
    const { isLogin } = user || {};
    const { tableId /*storeId*/ } = requestInfo;
    const { totalCashback } = cartBilling || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    let newOrderId;
    let currentOrder;

    if (beforeCreateOrder) {
      await beforeCreateOrder();
    }
    const { validCreateOrder } = this.props;
    // if (!Boolean(storeId)) {
    //   if (type === 'dine' || type === 'takeaway') {
    //     window.location.href = Constants.ROUTER_PATHS.DINE;
    //   } else {
    //     history.push({
    //       pathname: ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
    //       search: `${window.location.search}&callbackUrl=${history.location.pathname}`,
    //     });
    //   }

    //   return;
    // }

    if ((isLogin || type === 'digital') && paymentName !== 'SHOfflinePayment' && validCreateOrder) {
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
        Utils.setCookieVariable('__ty_source', 'cashback');
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
};

CreateOrderButton.defaultProps = {
  buttonType: 'button',
  validCreateOrder: true,
  isPromotionValid: true,
  disabled: true,
  sentOtp: false,
  processing: false,
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
      };
    },
    {
      createOrder,
      gotoPayment,
    }
  )
)(CreateOrderButton);
