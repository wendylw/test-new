import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  getCartSubmissionFailedStatus,
  getCartSubmittedStatus,
  getCartSubmissionHasNotResult,
  getCartSubmissionReceiptNumber,
} from '../../../../redux/cart/selectors';
import {
  queryCartSubmissionStatus as queryCartSubmissionStatusThunk,
  clearQueryCartSubmissionStatus as clearQueryCartSubmissionStatusThunk,
} from '../../../../redux/cart/thunks';
import Constants from '../../../../../utils/constants';
import Utils from '../../../../../utils/utils';
import orderSuccessImage from '../../../../../images/order-success.png';
import orderFailureImage from '../../../../../images/order-status-payment-cancelled.png';
import './CartSubmissionStatus.scss';

class CartSubmissionStatus extends Component {
  componentDidMount = async () => {
    const { queryCartSubmissionStatus, cartSubmittedStatus, history, receiptNumber } = this.props;
    const submissionId = Utils.getQueryString('submissionId');

    await queryCartSubmissionStatus(submissionId);

    // In order to prevent the user from going to this page but cartSubmittedStatus is true, so that it jumps directly away
    if (cartSubmittedStatus) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
        search: `${Utils.getFilteredQueryString(['submissionId'])}&receiptNumber=${receiptNumber}`,
      });
    }
  };

  componentDidUpdate = prevProps => {
    const { history, cartSubmittedStatus, receiptNumber } = this.props;
    const { cartSubmittedStatus: prevCartSubmittedStatus } = prevProps;

    if (cartSubmittedStatus && cartSubmittedStatus !== prevCartSubmittedStatus) {
      this.timer = setTimeout(() => {
        history.push({
          pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
          search: `${Utils.getFilteredQueryString(['submissionId'])}&receiptNumber=${receiptNumber}`,
        });
      }, 1500);
    }
  };

  componentWillUnmount = () => {
    const { clearQueryCartSubmissionStatus } = this.props;

    clearQueryCartSubmissionStatus();
    clearTimeout(this.timer);
  };

  handleClickBack = () => {
    const { history } = this.props;

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART,
      search: `${Utils.getFilteredQueryString(['submissionId'])}`,
    });
  };

  render() {
    const { t, pendingCartSubmissionResult, cartSubmittedStatus, cartSubmissionFailedStatus } = this.props;

    return (
      <section className="ordering-submission absolute-wrapper flex flex-column flex-center flex-middle">
        {pendingCartSubmissionResult && (
          <div className="margin-smaller">
            <i className="ordering-submission__loader loader default" />
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

CartSubmissionStatus.propTypes = {
  cartSubmittedStatus: PropTypes.bool,
  pendingCartSubmissionResult: PropTypes.bool,
  cartSubmissionFailedStatus: PropTypes.bool,
  receiptNumber: PropTypes.string,
  clearQueryCartSubmissionStatus: PropTypes.func,
  queryCartSubmissionStatus: PropTypes.func,
};

CartSubmissionStatus.defaultProps = {
  cartSubmittedStatus: false,
  pendingCartSubmissionResult: false,
  cartSubmissionFailedStatus: false,
  receiptNumber: null,
  clearQueryCartSubmissionStatus: () => {},
  queryCartSubmissionStatus: () => {},
};

export default compose(
  withTranslation(['OrderingCart']),
  connect(
    state => ({
      cartSubmittedStatus: getCartSubmittedStatus(state),
      pendingCartSubmissionResult: getCartSubmissionHasNotResult(state),
      cartSubmissionFailedStatus: getCartSubmissionFailedStatus(state),
      receiptNumber: getCartSubmissionReceiptNumber(state),
    }),
    dispatch => ({
      clearQueryCartSubmissionStatus: bindActionCreators(clearQueryCartSubmissionStatusThunk, dispatch),
      queryCartSubmissionStatus: bindActionCreators(queryCartSubmissionStatusThunk, dispatch),
    })
  )
)(CartSubmissionStatus);
