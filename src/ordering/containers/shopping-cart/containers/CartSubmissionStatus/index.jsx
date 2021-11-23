import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getCartSubmissionFailedStatus,
  getCartSubmittedStatus,
  getCartSubmissionPendingStatus,
} from '../../../../redux/cart/selectors';
import { queryCartSubmissionStatus, clearQueryCartSubmissionStatus } from '../../../../redux/cart/thunks';
import { actions as cartActionCreators } from '../../../../redux/cart';
import { withTranslation } from 'react-i18next';
import Constants from '../../../../../utils/constants';
import orderSuccessImage from '../../../../../images/order-success.png';
import orderFailureImage from '../../../../../images/order-status-payment-cancelled.png';
import './CartSubmissionStatus.scss';

class CartSubmissionStatus extends Component {
  componentDidMount = async () => {
    const { queryCartSubmissionStatus, cartSubmissionId } = this.props;
    // PAY_LATER_DEBUG: need to be changed
    await queryCartSubmissionStatus(cartSubmissionId);
  };

  componentDidUpdate = prevProps => {
    const { cartSubmittedStatus } = this.props;
    const { cartSubmittedStatus: prevCartSubmittedStatus } = prevProps;

    if (cartSubmittedStatus && cartSubmittedStatus !== prevCartSubmittedStatus) {
      this.timer = setTimeout(() => {
        this.props.history.push({
          pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
          search: window.location.search,
        });
      }, 1500);
    }
  };

  componentWillUnmount = () => {
    // const { clearQueryCartSubmissionStatus } = this.props;
    // PAY_LATER_DEBUG: stop polling
    // clearQueryCartSubmissionStatus();
    clearTimeout(this.timer);
  };

  render() {
    const { t, cartSubmissionPendingStatus, cartSubmittedStatus, cartSubmissionFailedStatus } = this.props;
    return (
      // PAY_LATER_DEBUG
      <section className="flex flex-column">
        {/* pending status */}
        {cartSubmissionPendingStatus && (
          <div className="ordering-submission__pending text-center">
            <p className="ordering-submission__loading-redirect text-size-big margin-left-right-small">
              {t('LoadingRedirectingDescription')}
            </p>
          </div>
        )}

        {/* success status */}
        {cartSubmittedStatus && (
          <div className="text-center">
            <img className="ordering-submission__image-container" src={orderSuccessImage} alt="order success" />
            <p className="text-size-biggest text-weight-bold padding-left-right-smaller margin-top-bottom-smaller">
              {t('OrderSubmitted')}
            </p>
            <p className="ordering-submission__loading-redirect text-size-big">{t('LoadingRedirectingDescription')}</p>
          </div>
        )}

        {/* failure status */}
        {cartSubmissionFailedStatus && (
          <div className="text-center">
            <img className="ordering-submission__image-container-failure" src={orderFailureImage} alt="order failure" />
            <p className="text-size-biggest text-weight-bold padding-left-right-smaller padding-smaller">
              {t('OrderSubmissedFailedTitle')}
            </p>
            <p className="ordering-submission__failure-redirect text-size-big">{t('ScanQRDescription')}</p>
            <button className="button button__fill margin-top-bottom-normal  padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder">
              {t('ReturnToCart')}
            </button>
          </div>
        )}
      </section>
    );
  }
}

CartSubmissionStatus.displayName = 'CartSubmissionStatus';

export default compose(
  withTranslation(['OrderingCart']),
  connect(
    state => {
      return {
        cartSubmittedStatus: getCartSubmittedStatus(state),
        cartSubmissionPendingStatus: getCartSubmissionPendingStatus(state),
        cartSubmissionFailedStatus: getCartSubmissionFailedStatus(state),
      };
    },
    dispatch => ({
      clearQueryCartSubmissionStatus: bindActionCreators(clearQueryCartSubmissionStatus, dispatch),
      queryCartSubmissionStatus: bindActionCreators(queryCartSubmissionStatus, dispatch),
      // PAY_LATER_DEBUG: need to change new functions
      cartActions: bindActionCreators(cartActionCreators, dispatch),
    })
  )
)(CartSubmissionStatus);
