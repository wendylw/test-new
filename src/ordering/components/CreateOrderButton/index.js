import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import qs from 'qs';
import Utils from '../../../utils/utils';
import { getUser, getRequestInfo, getError } from '../../redux/modules/app';
import { actions as paymentActionCreators, getThankYouPageUrl, getCurrentOrderId } from '../../redux/modules/payment';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import withDataAttributes from '../../../components/withDataAttributes';
import Constants from '../../../utils/constants';

const { ROUTER_PATHS, CREATE_ORDER_ERROR_CODES } = Constants;
const { PRODUCT_SOLD_OUT, PRODUCT_SOLD_OUT_EC } = CREATE_ORDER_ERROR_CODES;

class CreateOrderButton extends React.Component {
  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isFetching } = user || {};

    if (isFetching && !this.props.user.isLogin && isFetching !== this.props.user.isFetching) {
      this.visitLoginPage();
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
    const { history, paymentActions, user, requestInfo, cartSummary, afterCreateOrder, beforeCreateOrder } = this.props;
    const { isLogin } = user || {};
    const { tableId /*storeId*/ } = requestInfo;
    const { totalCashback } = cartSummary || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    let newOrderId;

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

    if ((isLogin || type === 'digital') && validCreateOrder) {
      await paymentActions.createOrder({ cashback: totalCashback, shippingType: type });

      const { currentOrder /*error*/ } = this.props;
      const { orderId } = currentOrder || {};

      newOrderId = orderId;

      if (orderId) {
        Utils.removeSessionVariable('additionalComments');
        Utils.removeSessionVariable('deliveryComments');
      }

      const { thankYouPageUrl } = this.props;

      if (thankYouPageUrl) {
        window.location = `${thankYouPageUrl}${tableId ? `&tableId=${tableId}` : ''}${type ? `&type=${type}` : ''}`;

        return;
      }
    }

    if (afterCreateOrder) {
      afterCreateOrder(newOrderId);
    }
  };

  render() {
    const { children, className, buttonType, disabled, dataAttributes } = this.props;
    const classList = ['button button__fill button__block text-weight-bolder'];

    if (className) {
      classList.push(className);
    }

    return (
      <button
        className={classList.join(' ')}
        type={buttonType}
        disabled={disabled}
        onClick={this.handleCreateOrder.bind(this)}
        {...dataAttributes}
      >
        {children}
      </button>
    );
  }
}

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
};

CreateOrderButton.defaultProps = {
  buttonType: 'button',
  validCreateOrder: true,
  isPromotionValid: true,
  disabled: true,
  sentOtp: false,
  beforeCreateOrder: () => {},
  afterCreateOrder: () => {},
};

export default compose(
  withDataAttributes,
  connect(
    state => {
      const currentOrderId = getCurrentOrderId(state);

      return {
        user: getUser(state),
        error: getError(state),
        requestInfo: getRequestInfo(state),
        cartSummary: getCartSummary(state),
        thankYouPageUrl: getThankYouPageUrl(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
      };
    },
    dispatch => ({
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(CreateOrderButton);
