import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as paymentActionCreators } from '../../../redux/modules/payment';

class CreateOrderButton extends React.Component {
  handleCreateOrder = async () => {
    const { history, paymentActions, cartSummary, visitNextPage } = this.props;
    const { totalCashback } = cartSummary || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    if (!validCreateOrder) {
      return;
    }

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

    visitNextPage();
  };

  render() {
    const { buttonType, buttonText, addonBefore, disabled, cartSummary } = this.props;
    const { total } = cartSummary || {};

    return (
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
      </button>
    );
  }
}

CreateOrderButton.propTypes = {
  user: PropTypes.object,
  history: PropTypes.object,
  cartSummary: PropTypes.object,
  currentOrder: PropTypes.object,
  className: PropTypes.string,
  buttonType: PropTypes.string,
  buttonText: PropTypes.string,
  addonBefore: PropTypes.bool,
  validCreateOrder: PropTypes.bool,
  isPromotionValid: PropTypes.bool,
  disabled: PropTypes.bool,
  visitNextPage: PropTypes.func,
};

CreateOrderButton.defaultProps = {
  buttonType: 'button',
  buttonText: '',
  validCreateOrder: false,
  isPromotionValid: true,
  disabled: true,
  visitNextPage: () => {},
};

export default compose(
  connect(
    state => {},
    dispatch => ({
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(CreateOrderButton);
