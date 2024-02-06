import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _debounce from 'lodash/debounce';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import { PATH_NAME_MAPPING } from '../../../common/utils/constants';
import { IconWrappedClose } from '../../../components/Icons';
import HybridHeader from '../../../components/HybridHeader';
import PromoList from './components/PromoList/PromoList';
import {
  actions as promotionActionCreators,
  getPromoCode,
  getPromoErrorCode,
  getIsAppliedSuccess,
  getIsAppliedError,
  isInProcess,
  getVoucherList,
  getFoundPromotion,
  isPromoSearchMode,
  hasSearchedForPromo as userHasSearchedForPromo,
  getSelectedPromo,
  getAppliedResult,
} from '../../redux/modules/promotion';
import {
  getPromoErrorCodePayLater,
  getIsAppliedSuccessPayLater,
  getIsAppliedErrorPayLater,
  getSelectPromoOrVoucherPayLater,
  getApplyPromoOrVoucherPendingStatus,
} from './redux/common/selector';
import {
  applyPromo as applyPromoThunk,
  applyVoucherPayLater as applyVoucherPayLaterThunk,
} from './redux/common/thunks';
import { actions as promoForPayLater } from './redux/common';
import {
  actions as appActionCreators,
  getUser,
  getOnlineStoreInfo,
  getStoreInfoForCleverTap,
  getPaymentInfoForCleverTap,
  getEnablePayLater,
  getIsFetchLoginStatusComplete,
} from '../../redux/modules/app';
import { getErrorMessageByPromoErrorCode } from './utils';
import Utils from '../../../utils/utils';
import CleverTap from '../../../utils/clevertap';
import logger from '../../../utils/monitoring/logger';
import './OrderingPromotion.scss';

class Promotion extends Component {
  promoCodeInput = null;

  debounceSearchPromo = _debounce(() => {
    const { promotionActions } = this.props;

    promotionActions.getPromoInfo();
  }, 700);

  constructor(props) {
    super(props);
    this.state = {
      containerHeight: this.getContainerHeight(),
    };
  }

  componentDidMount() {
    const { isFetchLoginStatusComplete, isUserLogin } = this.props;

    this.addResizeEventHandler();

    if (isFetchLoginStatusComplete && !isUserLogin) {
      this.gotoLoginPage();
    }
  }

  componentDidUpdate = prevProps => {
    const { isFetchLoginStatusComplete: prevIsFetchLoginStatusComplete } = prevProps;
    const { isUserLogin, isFetchLoginStatusComplete } = this.props;

    if (isFetchLoginStatusComplete && !prevIsFetchLoginStatusComplete && !isUserLogin) {
      this.gotoLoginPage();
    }
  };

  componentWillUnmount() {
    const { promoActions, promotionActions } = this.props;

    promotionActions.resetPromotion();
    promoActions.init();
    this.removeResizeEventHandler();
  }

  gotoLoginPage = () => {
    // TODO: will update login to HOC or hook
    const { history } = this.props;

    history.push({
      pathname: PATH_NAME_MAPPING.ORDERING_LOGIN,
      search: window.location.search,
      state: { shouldGoBack: true },
    });
  };

  getContainerHeight = () =>
    Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl],
    });

  handleResizeEvent = () => {
    this.setState({ containerHeight: this.getContainerHeight() });
  };

  addResizeEventHandler = () => {
    window.addEventListener('resize', this.handleResizeEvent);
  };

  removeResizeEventHandler = () => {
    window.removeEventListener('resize', this.handleResizeEvent);
  };

  handleCleanClick = () => {
    const { promotionActions } = this.props;

    promotionActions.updatePromoCode('');
    this.promoCodeInput && this.promoCodeInput.focus();
  };

  handleClickBack = () => {
    this.gotoCartOrTableSummaryPage();
  };

  gotoCartOrTableSummaryPage = () => {
    const { history } = this.props;

    history.goBack();
  };

  handleInputChange = e => {
    const { promotionActions } = this.props;
    const code = e.target.value.trim();

    promotionActions.updatePromoCode(code);
    if (!code) return;

    this.debounceSearchPromo();
  };

  handleApplyPromotion = async () => {
    const {
      inProcess,
      promotionActions,
      enablePayLater,
      applyPromo,
      selectPromoOrVoucherPayLater,
      applyPromoOrVoucherPendingStatus,
      applyVoucherPayLater,
    } = this.props;
    logger.log('Ordering_Promotion_ApplyPromotion');

    if (inProcess || applyPromoOrVoucherPendingStatus) {
      return;
    }

    !enablePayLater
      ? await promotionActions.applyPromo()
      : (selectPromoOrVoucherPayLater && (await applyPromo())) || (await applyVoucherPayLater());

    const { isAppliedSuccess, isAppliedSuccessPayLater, promoCode, paymentInfoForCleverTap } = this.props;

    if (isAppliedSuccess || isAppliedSuccessPayLater) {
      CleverTap.pushEvent('Cart Page - apply promo', {
        'promo/voucher applied': promoCode,
        ...paymentInfoForCleverTap,
      });
      this.gotoCartOrTableSummaryPage();
    }
  };

  handleSearchVoucher = searchingVoucher => {
    const { promotionActions } = this.props;

    promotionActions.setSearchMode(searchingVoucher);
  };

  getMessage = () => {
    const {
      appliedResult,
      onlineStoreInfo,
      promoErrorCodePayLater,
      enablePayLater,
      isAppliedSuccessPayLater,
    } = this.props;

    if (!enablePayLater) {
      if (!appliedResult || appliedResult.success) {
        return '';
      }
      const { code, extraInfo, extra, errorMessage } = appliedResult;
      // WB-7385: If pay later will use v3 API, extraInfo will be extra
      return getErrorMessageByPromoErrorCode(code, extraInfo || extra, errorMessage, onlineStoreInfo);
    }

    const { code, extraInfo, extra, errorMessage } = promoErrorCodePayLater;

    if (!code || isAppliedSuccessPayLater) {
      return '';
    }

    // WB-7385: If pay later will use v3 API, extraInfo will be extra
    return getErrorMessageByPromoErrorCode(code, extraInfo || extra, errorMessage, onlineStoreInfo);
  };

  render() {
    const {
      t,
      promoCode,
      isAppliedSuccess,
      isAppliedSuccessPayLater,
      isAppliedError,
      isAppliedErrorPayLater,
      inProcess,
      selectedPromo,
      enablePayLater,
      applyPromoOrVoucherPendingStatus,
    } = this.props;
    const { containerHeight } = this.state;
    const showCleanButton =
      promoCode.length > 0 &&
      !inProcess &&
      !isAppliedSuccess &&
      !isAppliedSuccessPayLater &&
      !applyPromoOrVoucherPendingStatus;
    let inputContainerStatus = '';
    if (isAppliedSuccess || isAppliedSuccessPayLater) {
      inputContainerStatus = 'success';
    } else if (isAppliedError || isAppliedErrorPayLater) {
      inputContainerStatus = 'error';
    }

    return (
      <section className="ordering-promotion flex flex-column" data-test-id="ordering.promotion.container">
        <HybridHeader
          className="flex-middle"
          contentClassName="flex-middle"
          data-test-id="ordering.promotion.header"
          isPage
          title={t('MyVouchersAndPromos')}
          titleAlignment="center"
          navFunc={this.handleClickBack}
          headerRef={ref => {
            this.headerEl = ref;
          }}
        />
        <div className="ordering-promotion__container padding-top-bottom-normal" style={{ height: containerHeight }}>
          <div className="ordering-promotion__input-container padding-small">
            <div
              className={`form__group flex flex-middle flex-space-between margin-top-bottom-smaller margin-left-right-small ${inputContainerStatus}`}
            >
              <input
                ref={ref => {
                  this.promoCodeInput = ref;
                }}
                disabled={isAppliedSuccess || inProcess}
                onChange={this.handleInputChange}
                onFocus={() => {
                  this.handleSearchVoucher(true);
                }}
                onBlur={() => {
                  this.handleSearchVoucher(false);
                }}
                value={promoCode}
                className="form__input padding-left-right-smaller margin-left-right-small text-size-big form__group "
                data-test-id="ordering.promotion.promotion-input"
                placeholder={t('EnterPromoCodeHere')}
              />
              {showCleanButton ? (
                <button
                  onClick={this.handleCleanClick}
                  className="ordering-promotion__button-close button flex__shrink-fixed"
                  data-test-id="ordering.promotion.clear-btn"
                >
                  <IconWrappedClose className="icon icon__small icon__default text-opacity" />
                </button>
              ) : null}
            </div>
            {!this.getMessage() ? null : (
              <p className="form__error-message margin-small text-weight-bolder">{this.getMessage()}</p>
            )}
          </div>
          <PromoList isPayLater={enablePayLater} />
        </div>

        <footer
          className="footer flex__shrink-fixed padding-small flex flex-middle flex-space-between"
          ref={ref => {
            this.footerEl = ref;
          }}
        >
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-test-id="ordering.promotion.apply-btn"
            disabled={!selectedPromo.code || inProcess || applyPromoOrVoucherPendingStatus}
            onClick={this.handleApplyPromotion}
          >
            {inProcess || applyPromoOrVoucherPendingStatus ? t('Processing') : t('Apply')}
          </button>
        </footer>
      </section>
    );
  }
}

Promotion.displayName = 'Promotion';

Promotion.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  onlineStoreInfo: PropTypes.object,
  appliedResult: PropTypes.object,
  selectedPromo: PropTypes.object,
  promoErrorCodePayLater: PropTypes.object,
  paymentInfoForCleverTap: PropTypes.object,
  /* eslint-enable */
  inProcess: PropTypes.bool,
  isUserLogin: PropTypes.bool,
  promoCode: PropTypes.string,
  enablePayLater: PropTypes.bool,
  isAppliedError: PropTypes.bool,
  isAppliedSuccess: PropTypes.bool,
  isAppliedErrorPayLater: PropTypes.bool,
  isAppliedSuccessPayLater: PropTypes.bool,
  isFetchLoginStatusComplete: PropTypes.bool,
  selectPromoOrVoucherPayLater: PropTypes.bool,
  applyPromoOrVoucherPendingStatus: PropTypes.bool,
  promoActions: PropTypes.shape({
    init: PropTypes.func,
  }),
  promotionActions: PropTypes.shape({
    applyPromo: PropTypes.func,
    getPromoInfo: PropTypes.func,
    setSearchMode: PropTypes.func,
    updatePromoCode: PropTypes.func,
    resetPromotion: PropTypes.func,
  }),
  applyPromo: PropTypes.func,
  applyVoucherPayLater: PropTypes.func,
};

Promotion.defaultProps = {
  promoCode: '',
  inProcess: false,
  isUserLogin: false,
  appliedResult: null,
  selectedPromo: {},
  onlineStoreInfo: {},
  enablePayLater: false,
  isAppliedError: false,
  isAppliedSuccess: false,
  paymentInfoForCleverTap: {},
  promoErrorCodePayLater: null,
  isAppliedErrorPayLater: false,
  isAppliedSuccessPayLater: false,
  isFetchLoginStatusComplete: false,
  selectPromoOrVoucherPayLater: false,
  applyPromoOrVoucherPendingStatus: false,
  promoActions: {
    init: () => {},
  },
  promotionActions: {
    applyPromo: () => {},
    getPromoInfo: () => {},
    setSearchMode: () => {},
    updatePromoCode: () => {},
    resetPromotion: () => {},
  },
  applyPromo: () => {},
  applyVoucherPayLater: () => {},
};

export default compose(
  withTranslation(['OrderingPromotion']),
  connect(
    state => ({
      promoCode: getPromoCode(state),
      errorCode: getPromoErrorCode(state),
      isAppliedSuccess: getIsAppliedSuccess(state),
      isAppliedErrorPayLater: getIsAppliedErrorPayLater(state),
      isAppliedSuccessPayLater: getIsAppliedSuccessPayLater(state),
      isAppliedError: getIsAppliedError(state),
      inProcess: isInProcess(state),
      voucherList: getVoucherList(state),
      user: getUser(state),
      isUserLogin: getUser(state).isLogin,
      foundPromo: getFoundPromotion(state),
      searchMode: isPromoSearchMode(state),
      hasSearchedForPromo: userHasSearchedForPromo(state),
      selectedPromo: getSelectedPromo(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      appliedResult: getAppliedResult(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      paymentInfoForCleverTap: getPaymentInfoForCleverTap(state),
      enablePayLater: getEnablePayLater(state),
      promoErrorCodePayLater: getPromoErrorCodePayLater(state),
      selectPromoOrVoucherPayLater: getSelectPromoOrVoucherPayLater(state),
      applyPromoOrVoucherPendingStatus: getApplyPromoOrVoucherPendingStatus(state),
      isFetchLoginStatusComplete: getIsFetchLoginStatusComplete(state),
    }),
    dispatch => ({
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      applyPromo: bindActionCreators(applyPromoThunk, dispatch),
      promoActions: bindActionCreators(promoForPayLater, dispatch),
      applyVoucherPayLater: bindActionCreators(applyVoucherPayLaterThunk, dispatch),
    })
  )
)(Promotion);
