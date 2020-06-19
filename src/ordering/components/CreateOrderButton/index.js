import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import qs from 'qs';
import Utils from '../../../utils/utils';
import { getUser } from '../../redux/modules/app';
import { actions as paymentActionCreators, getThankYouPageUrl, getCurrentOrderId } from '../../redux/modules/payment';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getCartSummary } from '../../../redux/modules/entities/carts';

class CreateOrderButton extends React.Component {
  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isLogin } = user || {};
    const { sentOtp, cartSummary } = this.props;
    const { total } = cartSummary || {};

    if (sentOtp && !total && isLogin && isLogin !== this.props.user.isLogin) {
      this.handleCreateOrder();
    }
  }

  handleCreateOrder = async () => {
    const {
      history,
      paymentActions,
      user,
      cartSummary,
      afterCreateOrder,
      beforeCreateOrder,
      validCreateOrder,
    } = this.props;
    const { isLogin } = user || {};
    const { totalCashback } = cartSummary || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    if (beforeCreateOrder) {
      await beforeCreateOrder();
    }

    if (isLogin && validCreateOrder) {
      await paymentActions.createOrder({ cashback: totalCashback, shippingType: type });

      const { currentOrder } = this.props;
      const { orderId } = currentOrder || {};

      if (orderId) {
        Utils.removeSessionVariable('additionalComments');
        Utils.removeSessionVariable('deliveryComments');
      }

      const { thankYouPageUrl } = this.props;

      if (thankYouPageUrl) {
        window.location = `${thankYouPageUrl}${window.location.search}`;

        return;
      }
    }

    if (afterCreateOrder) {
      afterCreateOrder();
    }
  };

  render() {
    const { children, className, buttonType, dataTestId, disabled } = this.props;
    const classList = ['billing__link button button__fill button__block font-weight-bolder'];

    if (className) {
      classList.push(className);
    }

    return (
      <button
        className={classList.join(' ')}
        type={buttonType}
        data-testid={dataTestId}
        disabled={disabled}
        onClick={this.handleCreateOrder.bind(this)}
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
  dataTestId: PropTypes.string,
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
  connect(
    state => {
      const currentOrderId = getCurrentOrderId(state);

      return {
        user: getUser(state),
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
