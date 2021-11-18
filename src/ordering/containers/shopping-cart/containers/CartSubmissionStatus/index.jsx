import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as cartActionCreators } from '../../../../redux/modules/cart';
import { withTranslation } from 'react-i18next';
// import orderSuccessImage from '../../../../../images/order-success.png';
// import orderFailureImage from '../../../../../images/order-status-payment-cancelled.png';
import './CartSubmissionStatus.scss';

class CartSubmissionStatus extends Component {
  componentDidMount = async () => {
    const { submissionId } = window.location;
    const { cartActions } = this.props;
    // TODO: need to be changed
    await cartActions.queryCartSubmissionStatus(submissionId);
  };

  componentWillUnmount = async () => {
    const { cartActions } = this.props;
    // TODO: stop polling
    await cartActions.clearQueryCartSubmissonStatus();
  };

  render() {
    const { t, cartSubmissionPending, cartSubmitted, cartSubmissionFailed } = this.props;
    return (
      // TODO
      <section className="flex flex-column">
        {/* pending status */}
        {cartSubmissionPending && (
          <div className="ordering-submission__pending text-center">
            <p className="ordering-submission__loading-redirect text-size-big margin-left-right-small">
              {t('LoadingRedirectingDescription')}
            </p>
          </div>
        )}

        {/* success status */}
        {/* {cartSubmitted && <div className="text-center">
          <img className="ordering-submission__image-container" src={orderSuccessImage} alt="order success" />
          <p className="text-size-biggest text-weight-bold padding-left-right-smaller margin-top-bottom-smaller">
            {t('OrderSubmitted')}
          </p>
          <p className="ordering-submission__loading-redirect text-size-big">{t('LoadingRedirectingDescription')}</p>
        </div>} */}

        {/* failure status */}
        {/* {cartSubmissionFailed &&  <div className="text-center">
          <img className="ordering-submission__image-container-failure" src={orderFailureImage} alt="order failure" />
          <p className="text-size-biggest text-weight-bold padding-left-right-smaller padding-smaller">
            {t('OrderSubmissedFailedTitle')}
          </p>
          <p className="ordering-submission__failure-redirect text-size-big">{t('ScanQRDescription')}</p>
          <button className="button button__fill margin-top-bottom-normal  padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder">
            {t('ReturnToCart')}
          </button>
        </div>} */}
      </section>
    );
  }
}

CartSubmissionStatus.displayName = 'CartSubmissionStatus';

export default compose(
  withTranslation(['OrderingCart']),
  connect(
    state => {
      return {};
    },
    dispatch => ({
      // TODO: need to change new functions
      cartActions: bindActionCreators(cartActionCreators, dispatch),
    })
  )
)(CartSubmissionStatus);
