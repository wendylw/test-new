import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as paymentActionCreators } from '../../../redux/modules/payment';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { getCurrentOrderId } from '../../../redux/modules/payment';

class CreateOrderButton extends React.Component {
  handleCreateOrder = async () => {
    const { history, paymentActions, cartSummary } = this.props;
    const { totalCashback } = cartSummary || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    await paymentActions.createOrder({ cashback: totalCashback, shippingType: type });

    const { currentOrder } = this.props;
    const { orderId } = currentOrder || {};

    if (orderId) {
      Utils.removeSessionVariable('additionalComments');
      Utils.removeSessionVariable('deliveryComments');
    }

    const { thankYouPageUrl } = this.props;

    if (thankYouPageUrl) {
      window.location = thankYouPageUrl;
    }

    return;
  };

  render() {
    const { buttonType, buttonText, addonBefore, disabled, cartSummary } = this.props;
    const { total } = cartSummary || {};

    <button
      className="billing__link button button__fill button__block font-weight-bolder"
      type={buttonType}
      data-testid="pay"
      disabled={disabled}
    >
      {addonBefore ? (
        <CurrencyNumber className="font-weight-bolder text-center" addonBefore={addonBefore} money={total || 0} />
      ) : (
        buttonText
      )}
    </button>;
  }
}

CreateOrderButton.propTypes = {
  history: PropTypes.object,
  className: PropTypes.string,
  buttonType: PropTypes.string,
  buttonText: PropTypes.string,
  addonBefore: PropTypes.bool,
  cartSummary: PropTypes.object,
  isPromotionValid: PropTypes.bool,
  disabled: PropTypes.bool,
};

CreateOrderButton.defaultProps = {
  buttonType: 'button',
  buttonText: '',
  isPromotionValid: true,
  disabled: true,
};

export default compose(
  connect(
    state => {
      const currentOrderId = getCurrentOrderId(state);

      return {
        currentOrder: getOrderByOrderId(state, currentOrderId),
      };
    },
    dispatch => ({
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(CreateOrderButton);
