import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import qs from 'qs';
import Utils from '../../../utils/utils';
import { getUser, getRequestInfo } from '../../redux/modules/app';
import { actions as paymentActionCreators, getThankYouPageUrl, getCurrentOrderId } from '../../redux/modules/payment';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import withDataAttributes from '../../../components/withDataAttributes';
import Constants from '../../../utils/constants';

const { ROUTER_PATHS } = Constants;

class CreateOrderButton extends React.Component {
  componentDidMount() {
    this.visitCustomerPage();
  }

  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isLogin } = user || {};
    const { sentOtp, cartSummary } = this.props;
    const { total } = cartSummary || {};

    if (!isLogin && isLogin !== this.props.user.isLogin) {
      this.visitCustomerPage();
    }

    if (sentOtp && !total && isLogin && isLogin !== this.props.user.isLogin) {
      this.handleCreateOrder();
    }
  }

  visitCustomerPage = () => {
    const { history, user } = this.props;
    const { isLogin } = user || {};
    const { location } = history || {};
    const { pathname } = location || {};

    if (!isLogin && pathname !== ROUTER_PATHS.ORDERING_CUSTOMER_INFO) {
      history.push({
        pathname: ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
        search: window.location.search,
      });
    }
  };

  handleCreateOrder = async () => {
    const {
      history,
      paymentActions,
      user,
      requestInfo,
      cartSummary,
      afterCreateOrder,
      beforeCreateOrder,
      validCreateOrder,
    } = this.props;
    const { isLogin } = user || {};
    const { tableId, storeId } = requestInfo;
    const { totalCashback } = cartSummary || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    let newOrderId;

    if (beforeCreateOrder) {
      await beforeCreateOrder();
    }

    if (!storeId) {
      history.push({
        pathname: ROUTER_PATHS.ORDERING_STORE_LIST,
        search: window.location.search,
      });
    }

    if ((isLogin || type === 'digital') && validCreateOrder) {
      await paymentActions.createOrder({ cashback: totalCashback, shippingType: type });

      const { currentOrder } = this.props;
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
    const classList = ['billing__link button button__fill button__block font-weight-bolder'];

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
