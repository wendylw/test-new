import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { IconChecked } from '../../../../../components/Icons';
import RedirectPageLoader from '../../../../components/RedirectPageLoader';
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
import orderSuccessImage from '../../../../../images/order-success-1.svg';
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
        pathname: Constants.ROUTER_PATHS.ORDERING_CART_SUBMISSION_STATUS,
        search: `${Utils.getFilteredQueryString(['submissionId', 'receiptNumber'])}&receiptNumber=${receiptNumber}`,
      });
    }
  };

  componentWillUnmount = () => {
    const { clearQueryCartSubmissionStatus } = this.props;

    clearQueryCartSubmissionStatus();
  };

  handleClickBack = () => {
    const { history } = this.props;

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART,
      search: `${Utils.getFilteredQueryString(['submissionId', 'receiptNumber'])}`,
    });
  };

  getOrderStatusOptionsEl = () => {
    const { t, cartSubmittedStatus } = this.props;
    let options = null;

    if (cartSubmittedStatus) {
      options = {
        className: 'ordering-submission__base-info-status--created',
        icon: <IconChecked className="icon icon__success padding-small" />,
        title: (
          <span className="margin-left-right-smaller text-size-biggest text-capitalize">{t('OrderPlacedStatus')}</span>
        ),
      };
    }

    return (
      options && (
        <div className={`${options.className} flex flex-middle padding-small`}>
          {options.icon}
          {options.title}
        </div>
      )
    );
  };

  handleClickAddMoreItems = () => {
    const { history } = this.props;

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      search: `${Utils.getFilteredQueryString(['submissionId', 'receiptNumber'])}`,
    });
  };

  handleClickViewTableSummary = () => {
    const { history, receiptNumber } = this.props;

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
      search: `${Utils.getFilteredQueryString(['submissionId', 'receiptNumber'])}&receiptNumber=${receiptNumber}`,
    });
  };

  render() {
    const { t, pendingCartSubmissionResult, cartSubmittedStatus, cartSubmissionFailedStatus } = this.props;

    return (
      <section className="ordering-submission absolute-wrapper flex flex-column flex-center flex-middle">
        {pendingCartSubmissionResult && <RedirectPageLoader />}
        {cartSubmittedStatus && (
          <>
            <div className="ordering-submission__warning absolute-wrapper padding-small flex flex-middle flex-center">
              <span>{t('OrderPlacedTitle')}</span>
            </div>
            <div className="ordering-submission__success absolute-wrapper flex flex-column flex-middle">
              {this.getOrderStatusOptionsEl()}
              <img className="ordering-submission__image-container-new" src={orderSuccessImage} alt="order success" />
              <h2 className="ordering-submission__description text-size-big padding-left-right-normal margin-top-bottom-normal text-line-height-base">
                {t('OrderPlacedDescription')}
              </h2>
              <div className="ordering-submission__button-container flex flex-column flex-middle flex-center">
                <button
                  className="ordering-submission__button button button__fill margin-small padding-normal text-uppercase text-weight-bolder"
                  onClick={this.handleClickAddMoreItems}
                >
                  {t('AddMoreItems')}
                </button>
                <button
                  className="ordering-submission__button-second button margin-small padding-normal text-uppercase text-weight-bolder"
                  onClick={this.handleClickViewTableSummary}
                >
                  {t('ViewOrderOrPay')}
                </button>
              </div>
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
