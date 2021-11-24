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
import { withTranslation } from 'react-i18next';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';
import orderSuccessImage from '../../../../../images/order-success.png';
import orderFailureImage from '../../../../../images/order-status-payment-cancelled.png';
import './CartSubmissionStatus.scss';

class CartSubmissionStatus extends Component {
  componentDidMount = async () => {
    const { queryCartSubmissionStatus } = this.props;
    const submissionId = Utils.getQueryString('submissionId');
    await queryCartSubmissionStatus(submissionId);
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

  componentWillUnmount = async () => {
    const { clearQueryCartSubmissionStatus } = this.props;
    await clearQueryCartSubmissionStatus();
    await clearTimeout(this.timer);
  };

  handleClickBack = async () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART,
      search: window.location.search,
    });
  };

  render() {
    const { t, cartSubmissionPendingStatus, cartSubmittedStatus, cartSubmissionFailedStatus } = this.props;

    return (
      <section className="ordering-submission absolute-wrapper flex flex-column flex-center flex-middle">
        {cartSubmissionPendingStatus && (
          <div className="margin-smaller">
            <div className="ordering-submission__loader loader default"></div>
            <p className="ordering-submission__pending-description margin-top-bottom-normal text-center text-size-big text-line-height-base">
              {t('LoadingRedirectingDescription')}
            </p>
          </div>
        )}

        {cartSubmittedStatus && (
          <>
            <img className="ordering-submission__image-container-common" src={orderSuccessImage} alt="order success" />
            <h2 className="text-size-biggest text-weight-bold text-line-height-base">{t('OrderSubmitted')}</h2>
            <div className="padding-bottom-normal">
              <p className="ordering-submission__success-description text-center margin-top-bottom-smaller text-size-big text-line-height-base">
                {t('LoadingRedirectingDescription')}
              </p>
            </div>
          </>
        )}

        {cartSubmissionFailedStatus && (
          <>
            <img className="ordering-submission__image-container-common" src={orderFailureImage} alt="order failure" />
            <div className="margin-smaller text-center">
              <h2 className="text-size-biggest text-weight-bold text-line-height-base">
                {t('OrderSubmittedFailedTitle')}
              </h2>
              <p className="ordering-submission__failure-description margin-top-bottom-smaller text-center text-size-big text-line-height-base">
                {t('ScanQRDescription')}
              </p>
            </div>
            <div className="padding-top-bottom-normal margin-smaller">
              <button
                onClick={this.handleClickBack}
                className="button button__fill padding-normal text-uppercase text-weight-bolder"
              >
                {t('ReturnToCart')}
              </button>
            </div>
          </>
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
    })
  )
)(CartSubmissionStatus);
