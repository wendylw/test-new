import React, { Component } from 'react';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import Constants from '../../../utils/constants';
import { IconWrappedClose } from '../../../components/Icons';
import Header from '../../../components/Header';
import PromoList from './components/PromoList/PromoList';

import { bindActionCreators, compose } from 'redux';
import {
  actions as promotionActionCreators,
  getPromoCode,
  getCode,
  isAppliedSuccess,
  isAppliedError,
  isInProcess,
  getVoucherList,
  getFoundPromotion,
  isPromoSearchMode,
  hasSearchedForPromo as userHasSearchedForPromo,
  getSelectedPromo,
} from '../../redux/modules/promotion';
import { actions as appActionCreators, getUser, getOnlineStoreInfo } from '../../redux/modules/app';
import { withTranslation } from 'react-i18next';
import { getErrorMessageByPromoErrorCode } from './utils';
import Utils from '../../../utils/utils';
import './OrderingPromotion.scss';

class Promotion extends Component {
  promoCodeInput = null;

  componentWillUnmount() {
    this.props.promotionActions.resetPromotion();
  }

  handleCleanClick = () => {
    this.props.promotionActions.updatePromoCode('');
    this.promoCodeInput && this.promoCodeInput.focus();
  };

  handleClickBack = () => {
    this.gotoCartPage();
  };

  gotoCartPage = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART,
      search: window.location.search,
    });
  };

  debounceSearchPromo = debounce(() => {
    this.props.promotionActions.getPromoInfo();
  }, 700);

  handleInputChange = e => {
    const code = e.target.value.trim();
    this.props.promotionActions.updatePromoCode(code);
    if (!code) return;

    this.debounceSearchPromo();
  };

  handleApplyPromotion = async () => {
    if (this.props.inProcess) {
      return false;
    }

    await this.props.promotionActions.applyPromo();

    if (this.props.isAppliedSuccess) {
      this.gotoCartPage();
    }
  };

  handleSearchVoucher = searchingVoucher => {
    this.props.promotionActions.setSearchMode(searchingVoucher);
  };

  selectPromo = promo => {
    this.props.promotionActions.selectPromo(promo);
  };

  getMessage = () => {
    const { errorCode } = this.props;
    if (!errorCode) {
      return '';
    }

    return getErrorMessageByPromoErrorCode({
      code: errorCode,
    });
  };

  render() {
    const { t, promoCode, isAppliedSuccess, isAppliedError, inProcess, selectedPromo } = this.props;
    const showCleanButton = promoCode.length > 0 && !inProcess && !isAppliedSuccess;
    let inputContainerStatus = '';
    if (isAppliedSuccess) {
      inputContainerStatus = 'success';
    } else if (isAppliedError) {
      inputContainerStatus = 'error';
    }

    return (
      <section className="ordering-promotion flex flex-column" data-heap-name="ordering.promotion.container">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="ordering.promotion.header"
          isPage={true}
          title={t('MyVouchersAndPromos')}
          navFunc={this.handleClickBack}
          headerRef={ref => (this.headerEl = ref)}
        ></Header>
        <div
          className="ordering-promotion__container padding-top-bottom-normal"
          style={{
            height: Utils.containerHeight({
              headerEls: [this.headerEl],
              footerEls: [this.footerEl],
            }),
          }}
        >
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
          <PromoList />
        </div>

        <footer
          className="footer flex__shrink-fixed padding-small flex flex-middle flex-space-between"
          ref={ref => (this.footerEl = ref)}
        >
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-heap-name="ordering.promotion.apply-btn"
            disabled={!selectedPromo.code || isAppliedSuccess}
            onClick={this.handleApplyPromotion}
          >
            {inProcess ? t('Processing') : t('Apply')}
          </button>
        </footer>
      </section>
    );
  }
}
export default compose(
  withTranslation(['OrderingPromotion']),
  connect(
    state => {
      return {
        promoCode: getPromoCode(state),
        errorCode: getCode(state),
        isAppliedSuccess: isAppliedSuccess(state),
        isAppliedError: isAppliedError(state),
        inProcess: isInProcess(state),
        voucherList: getVoucherList(state),
        user: getUser(state),
        foundPromo: getFoundPromotion(state),
        searchMode: isPromoSearchMode(state),
        hasSearchedForPromo: userHasSearchedForPromo(state),
        selectedPromo: getSelectedPromo(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
      };
    },
    dispatch => ({
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Promotion);
