import React, { Component } from 'react';
import { connect } from 'react-redux';
import _debounce from 'lodash/debounce';
import { IconWrappedClose } from '../../../components/Icons';
import HybridHeader from '../../../components/HybridHeader';
import PromoList from './components/PromoList/PromoList';
import { bindActionCreators, compose } from 'redux';
import {
  actions as promotionActionCreators,
  getPromoCode,
  getPromoErrorCode,
  isAppliedSuccess,
  isAppliedError,
  isInProcess,
  getVoucherList,
  getFoundPromotion,
  isPromoSearchMode,
  hasSearchedForPromo as userHasSearchedForPromo,
  getSelectedPromo,
  getAppliedResult,
} from '../../redux/modules/promotion';
import {
  getApplyPromoPendingStatus,
  getPromoErrorCodePayLater,
  getIsAppliedSuccessPayLater,
} from './redux/common/selector';
import { applyPromo as applyPromoThunk } from './redux/common/thunks';
import { actions as promoForPayLater } from './redux/common';
import {
  actions as appActionCreators,
  getUser,
  getOnlineStoreInfo,
  getStoreInfoForCleverTap,
  getEnablePayLater,
} from '../../redux/modules/app';
import { withTranslation } from 'react-i18next';
import { getErrorMessageByPromoErrorCode } from './utils';
import Utils from '../../../utils/utils';
import CleverTap from '../../../utils/clevertap';
import loggly from '../../../utils/monitoring/loggly';
import './OrderingPromotion.scss';

class Promotion extends Component {
  promoCodeInput = null;

  constructor(props) {
    super(props);
    this.state = {
      containerHeight: this.getContainerHeight(),
    };
  }

  componentDidMount() {
    this.addResizeEventHandler();
  }

  componentWillUnmount() {
    this.props.promotionActions.resetPromotion();
    this.props.promoActions.init();
    this.removeResizeEventHandler();
  }

  getContainerHeight = () => {
    return Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl],
    });
  };

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
    this.props.promotionActions.updatePromoCode('');
    this.promoCodeInput && this.promoCodeInput.focus();
  };

  handleClickBack = () => {
    this.gotoCartOrTableSummaryPage();
  };

  gotoCartOrTableSummaryPage = () => {
    this.props.history.goBack();
  };

  debounceSearchPromo = _debounce(() => {
    this.props.promotionActions.getPromoInfo();
  }, 700);

  handleInputChange = e => {
    const code = e.target.value.trim();
    this.props.promotionActions.updatePromoCode(code);
    if (!code) return;

    this.debounceSearchPromo();
  };

  handleApplyPromotion = async () => {
    const { enablePayLater, applyPromo } = this.props;
    loggly.log('promotion.apply-attempt');

    if (this.props.inProcess || this.props.inProcessPayLater) {
      return false;
    }

    !enablePayLater ? await this.props.promotionActions.applyPromo() : await applyPromo();

    if (this.props.isAppliedSuccess || this.props.isAppliedSuccessPayLater.success) {
      CleverTap.pushEvent('Cart Page - apply promo', {
        'promo/voucher applied': this.props.promoCode,
      });
      this.gotoCartOrTableSummaryPage();
    }
  };

  handleSearchVoucher = searchingVoucher => {
    this.props.promotionActions.setSearchMode(searchingVoucher);
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
      const { code, extraInfo, errorMessage } = appliedResult;
      return getErrorMessageByPromoErrorCode(code, extraInfo, errorMessage, onlineStoreInfo);
    } else {
      const { code, extraInfo, errorMessage } = promoErrorCodePayLater;

      if (!code || isAppliedSuccessPayLater.success) {
        return '';
      }

      return getErrorMessageByPromoErrorCode(code, extraInfo, errorMessage, onlineStoreInfo);
    }
  };

  render() {
    const {
      t,
      promoCode,
      isAppliedSuccess,
      isAppliedSuccessPayLater,
      isAppliedError,
      promoErrorCodePayLater,
      inProcess,
      inProcessPayLater,
      selectedPromo,
      enablePayLater,
    } = this.props;
    const { containerHeight } = this.state;
    const showCleanButton =
      promoCode.length > 0 && !inProcess && !isAppliedSuccess && !inProcessPayLater && !isAppliedSuccessPayLater;
    let inputContainerStatus = '';
    if (isAppliedSuccess || isAppliedSuccessPayLater) {
      inputContainerStatus = 'success';
    } else if (isAppliedError || promoErrorCodePayLater) {
      inputContainerStatus = 'error';
    }

    return (
      <section className="ordering-promotion flex flex-column" data-heap-name="ordering.promotion.container">
        <HybridHeader
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="ordering.promotion.header"
          isPage={true}
          title={t('MyVouchersAndPromos')}
          titleAlignment="center"
          navFunc={this.handleClickBack}
          headerRef={ref => (this.headerEl = ref)}
        ></HybridHeader>
        <div className="ordering-promotion__container padding-top-bottom-normal" style={{ height: containerHeight }}>
          <div className="ordering-promotion__input-container padding-small">
            <div
              className={
                'form__group flex flex-middle flex-space-between margin-top-bottom-smaller margin-left-right-small ' +
                inputContainerStatus
              }
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
                data-heap-name="ordering.promotion.promotion-input"
                placeholder={t('EnterPromoCodeHere')}
              />
              {showCleanButton ? (
                <button
                  onClick={this.handleCleanClick}
                  className="ordering-promotion__button-close button flex__shrink-fixed"
                  data-heap-name="ordering.promotion.clear-btn"
                >
                  <IconWrappedClose className="icon icon__small icon__default text-opacity" />
                </button>
              ) : null}
            </div>
            {Boolean(this.getMessage()) ? (
              <p className="form__error-message margin-small text-weight-bolder">{this.getMessage()}</p>
            ) : null}
          </div>
          <PromoList isPayLater={enablePayLater} />
        </div>

        <footer
          className="footer flex__shrink-fixed padding-small flex flex-middle flex-space-between"
          ref={ref => (this.footerEl = ref)}
        >
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-heap-name="ordering.promotion.apply-btn"
            disabled={!selectedPromo.code || inProcess || inProcessPayLater}
            onClick={this.handleApplyPromotion}
          >
            {inProcess || inProcessPayLater ? t('Processing') : t('Apply')}
          </button>
        </footer>
      </section>
    );
  }
}
Promotion.displayName = 'Promotion';
export default compose(
  withTranslation(['OrderingPromotion']),
  connect(
    state => {
      return {
        promoCode: getPromoCode(state),
        errorCode: getPromoErrorCode(state),
        isAppliedSuccess: isAppliedSuccess(state),
        isAppliedSuccessPayLater: getIsAppliedSuccessPayLater(state),
        isAppliedError: isAppliedError(state),
        inProcess: isInProcess(state),
        inProcessPayLater: getApplyPromoPendingStatus(state),
        voucherList: getVoucherList(state),
        user: getUser(state),
        foundPromo: getFoundPromotion(state),
        searchMode: isPromoSearchMode(state),
        hasSearchedForPromo: userHasSearchedForPromo(state),
        selectedPromo: getSelectedPromo(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        appliedResult: getAppliedResult(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
        enablePayLater: getEnablePayLater(state),
        promoErrorCodePayLater: getPromoErrorCodePayLater(state),
      };
    },
    dispatch => ({
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      applyPromo: bindActionCreators(applyPromoThunk, dispatch),
      promoActions: bindActionCreators(promoForPayLater, dispatch),
    })
  )
)(Promotion);
