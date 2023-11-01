import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { IconChecked } from '../../../../../components/Icons';
import RedirectPageLoader from '../../../../components/RedirectPageLoader';
import NativeHeader from '../../../../../components/NativeHeader';
import {
  getCartSubmissionFailedStatus,
  getCartSubmittedStatus,
  getCartSubmissionHasNotResult,
  getCartSubmissionReceiptNumber,
} from '../../../../redux/modules/cart/selectors';
import {
  getHasPayLaterOrderTableIdChanged as getHasTableIdChanged,
  getPayLaterStoreHash as getStoreHash,
  getPayLaterOrderStatusTableId as getOrderTableId,
} from '../../redux/selector';
import {
  queryCartSubmissionStatus as queryCartSubmissionStatusThunk,
  clearQueryCartSubmissionStatus as clearQueryCartSubmissionStatusThunk,
} from '../../../../redux/modules/cart/thunks';
import { loadPayLaterOrderStatus as loadOrderStatusThunk } from '../../redux/thunks';
import { getCleverTapAttributes } from './redux/selector';
import { getIsWebview } from '../../../../redux/modules/app';
import Constants from '../../../../../utils/constants';
import Utils from '../../../../../utils/utils';
import prefetch from '../../../../../common/utils/prefetch-assets';
import orderSuccessImage from '../../../../../images/order-success-1.svg';
import orderFailureImage from '../../../../../images/order-status-payment-cancelled.png';
import PageProcessingLoader from '../../../../components/PageProcessingLoader';
import { alert } from '../../../../../common/utils/feedback';
import CleverTap from '../../../../../utils/clevertap';
import './CartSubmissionStatus.scss';

class CartSubmissionStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldShowProcessingLoader: false,
    };
  }

  componentDidMount = async () => {
    const { queryCartSubmissionStatus, cartSubmittedStatus, history, receiptNumber, cleverTapAttributes } = this.props;
    const submissionId = Utils.getQueryString('submissionId');

    await queryCartSubmissionStatus(submissionId);

    CleverTap.pushEvent('Order Placed Page - View Page', cleverTapAttributes);

    // In order to prevent the user from going to this page but cartSubmittedStatus is true, so that it jumps directly away
    if (cartSubmittedStatus) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CART_SUBMISSION_STATUS,
        search: `${Utils.getFilteredQueryString(['submissionId', 'receiptNumber'])}&receiptNumber=${receiptNumber}`,
      });
    }

    prefetch(['ORD_MNU', 'ORD_SC', 'ORD_TS', 'ORD_PL'], ['OrderingDelivery', 'OrderingCart', 'OrderingTableSummary']);
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
        <div className={`${options.className} flex flex-middle`}>
          {options.icon}
          {options.title}
        </div>
      )
    );
  };

  handleHeaderNavFunc = async () => {
    const { t, history, receiptNumber, loadOrderStatus } = this.props;

    await loadOrderStatus(receiptNumber);

    const { hasTableIdChanged, storeHash, orderTableId } = this.props;

    if (hasTableIdChanged) {
      alert(t('TableNumberUpdatedDescription'), {
        id: 'TableNumberUpdatedAlert',
        title: t('TableNumberUpdatedTitle'),
        closeButtonContent: t('GotIt'),
        onClose: () => {
          this.setState({ shouldShowProcessingLoader: true });
          window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.ORDERING_BASE}${
            Constants.ROUTER_PATHS.ORDERING_HOME
          }${Utils.getFilteredQueryString([
            'h',
            'table',
            'receiptNumber',
            'submissionId',
          ])}&h=${storeHash}&table=${orderTableId}`;
        },
      });
      return;
    }

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      search: `${Utils.getFilteredQueryString(['submissionId', 'receiptNumber'])}`,
    });
  };

  handleClickAddMoreItems = async () => {
    const { t, history, cleverTapAttributes, receiptNumber, loadOrderStatus } = this.props;

    CleverTap.pushEvent('Order Placed Page - Add More Items', cleverTapAttributes);

    await loadOrderStatus(receiptNumber);

    const { hasTableIdChanged, storeHash, orderTableId } = this.props;

    if (hasTableIdChanged) {
      alert(t('TableNumberUpdatedDescription'), {
        id: 'TableNumberUpdatedAlert',
        title: t('TableNumberUpdatedTitle'),
        closeButtonContent: t('GotIt'),
        onClose: () => {
          this.setState({ shouldShowProcessingLoader: true });
          window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.ORDERING_BASE}${
            Constants.ROUTER_PATHS.ORDERING_HOME
          }${Utils.getFilteredQueryString([
            'h',
            'table',
            'receiptNumber',
            'submissionId',
          ])}&h=${storeHash}&table=${orderTableId}`;
        },
      });
      return;
    }

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      search: `${Utils.getFilteredQueryString(['submissionId', 'receiptNumber'])}`,
    });
  };

  handleClickViewTableSummary = async () => {
    const { t, history, receiptNumber, cleverTapAttributes, loadOrderStatus } = this.props;

    CleverTap.pushEvent('Order Placed Page - View Order', cleverTapAttributes);

    await loadOrderStatus(receiptNumber);

    const { hasTableIdChanged, storeHash, orderTableId } = this.props;

    if (hasTableIdChanged) {
      alert(t('TableNumberUpdatedDescription'), {
        id: 'TableNumberUpdatedAlert',
        title: t('TableNumberUpdatedTitle'),
        closeButtonContent: t('GotIt'),
        onClose: () => {
          this.setState({ shouldShowProcessingLoader: true });
          window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.ORDERING_BASE}${
            Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY
          }${Utils.getFilteredQueryString([
            'h',
            'table',
            'receiptNumber',
            'submissionId',
          ])}&h=${storeHash}&table=${orderTableId}&receiptNumber=${receiptNumber}`;
        },
      });
      return;
    }

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
      search: `${Utils.getFilteredQueryString(['submissionId', 'receiptNumber'])}&receiptNumber=${receiptNumber}`,
    });
  };

  render() {
    const { t, isWebview, pendingCartSubmissionResult, cartSubmittedStatus, cartSubmissionFailedStatus } = this.props;
    const { shouldShowProcessingLoader } = this.state;

    return (
      <section className="ordering-submission absolute-wrapper">
        {isWebview && <NativeHeader isPage title="" navFunc={this.handleHeaderNavFunc} />}
        {pendingCartSubmissionResult && <RedirectPageLoader />}
        {cartSubmittedStatus && (
          <>
            <div className="ordering-submission__success flex__fluid-content flex flex-column flex-middle">
              {this.getOrderStatusOptionsEl()}
              <img className="ordering-submission__image-container-new" src={orderSuccessImage} alt="order success" />
              <h2 className="ordering-submission__description text-size-big padding-left-right-normal margin-top-bottom-normal">
                {t('OrderPlacedDescription')}
              </h2>
              <div className="ordering-submission__button-container flex flex-column flex-middle flex-center padding-small">
                <button
                  className="ordering-submission__button button button__fill padding-normal text-uppercase text-weight-bolder"
                  data-test-id="ordering.order-status.cart-submission-status.view-order-btn"
                  onClick={this.handleClickViewTableSummary}
                >
                  {t('ViewOrder')}
                </button>
                <button
                  className="ordering-submission__button button button__outline padding-normal text-uppercase text-weight-bolder"
                  data-test-id="ordering.order-status.cart-submission-status.add-item-btn"
                  onClick={this.handleClickAddMoreItems}
                >
                  {t('AddMoreItems')}
                </button>
              </div>
            </div>
            <PageProcessingLoader show={shouldShowProcessingLoader} loaderText={t('Processing')} />
          </>
        )}

        {cartSubmissionFailedStatus && (
          <div className="ordering-submission__failure flex__fluid-content flex flex-column flex-middle">
            <img className="ordering-submission__image-container-common" src={orderFailureImage} alt="order failure" />
            <div className="margin-top-bottom-small margin-left-right-smaller text-center">
              <h2 className="text-size-biggest text-weight-bolder text-line-height-base">
                {t('OrderSubmittedFailedTitle')}
              </h2>
              <p className="ordering-submission__failure-description margin-top-bottom-smaller text-center text-size-big text-line-height-base">
                {t('ScanQRDescription')}
              </p>
            </div>
            <div className="padding-top-bottom-normal margin-smaller">
              <button
                onClick={this.handleClickBack}
                className="ordering-submission__return-button button button__fill padding-normal text-uppercase text-weight-bolder"
                data-test-id="ordering.order-status.cart-submission-status.back-btn"
              >
                {t('ReturnToCart')}
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }
}

CartSubmissionStatus.displayName = 'CartSubmissionStatus';

CartSubmissionStatus.propTypes = {
  isWebview: PropTypes.bool,
  storeHash: PropTypes.string,
  orderTableId: PropTypes.string,
  hasTableIdChanged: PropTypes.bool,
  cartSubmittedStatus: PropTypes.bool,
  pendingCartSubmissionResult: PropTypes.bool,
  cartSubmissionFailedStatus: PropTypes.bool,
  receiptNumber: PropTypes.string,
  clearQueryCartSubmissionStatus: PropTypes.func,
  queryCartSubmissionStatus: PropTypes.func,
  loadOrderStatus: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  cleverTapAttributes: PropTypes.object,
};

CartSubmissionStatus.defaultProps = {
  isWebview: false,
  storeHash: null,
  orderTableId: null,
  hasTableIdChanged: false,
  cartSubmittedStatus: false,
  pendingCartSubmissionResult: false,
  cartSubmissionFailedStatus: false,
  receiptNumber: null,
  clearQueryCartSubmissionStatus: () => {},
  queryCartSubmissionStatus: () => {},
  loadOrderStatus: () => {},
  cleverTapAttributes: {},
};

export default compose(
  withTranslation(['OrderingCart']),
  connect(
    state => ({
      isWebview: getIsWebview(state),
      storeHash: getStoreHash(state),
      orderTableId: getOrderTableId(state),
      cartSubmittedStatus: getCartSubmittedStatus(state),
      pendingCartSubmissionResult: getCartSubmissionHasNotResult(state),
      cartSubmissionFailedStatus: getCartSubmissionFailedStatus(state),
      receiptNumber: getCartSubmissionReceiptNumber(state),
      cleverTapAttributes: getCleverTapAttributes(state),
      hasTableIdChanged: getHasTableIdChanged(state),
    }),
    dispatch => ({
      clearQueryCartSubmissionStatus: bindActionCreators(clearQueryCartSubmissionStatusThunk, dispatch),
      queryCartSubmissionStatus: bindActionCreators(queryCartSubmissionStatusThunk, dispatch),
      loadOrderStatus: bindActionCreators(loadOrderStatusThunk, dispatch),
    })
  )
)(CartSubmissionStatus);
