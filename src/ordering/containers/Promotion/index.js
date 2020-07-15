import React, { Component } from 'react';
import { connect } from 'react-redux';
import Constants from '../../../utils/constants';
import { IconClose } from '../../../components/Icons';

import { bindActionCreators, compose } from 'redux';
import {
  actions as promotionActionCreators,
  getPromoCode,
  getStatus,
  getPromoValidFrom,
  isAppliedSuccess,
  isAppliedError,
  isInProcess,
} from '../../redux/modules/promotion';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import { getErrorMessageByPromoStatus } from './utils';
import './OrderingPromotion.scss';

class Promotion extends Component {
  promoCodeInput = null;

  componentDidMount() {
    this.initialPromotion();
  }

  initialPromotion() {
    this.props.promotionActions.initialPromotion();
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

  handleInputChange = e => {
    const code = e.target.value.trim();
    this.props.promotionActions.updatePromoCode(code);
  };

  handleApplyPromotion = async () => {
    if (this.props.inProcess) {
      return false;
    }

    await this.props.promotionActions.applyPromoCode();

    if (this.props.isAppliedSuccess) {
      this.gotoCartPage();
    }
  };

  getMessage = () => {
    const { promoStatus, validFrom } = this.props;
    if (!promoStatus) {
      return '';
    }

    return getErrorMessageByPromoStatus({
      status: promoStatus,
      validFrom,
    });
  };

  render() {
    const { t, promoCode, isAppliedSuccess, isAppliedError, inProcess } = this.props;
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
        ></Header>

        <div className="ordering-promotion__container padding-top-bottom-normal padding-left-right-small">
          <div className={'form__group flex flex-middle flex-space-between margin-smallest ' + inputContainerStatus}>
            <input
              ref={ref => {
                this.promoCodeInput = ref;
              }}
              disabled={isAppliedSuccess || inProcess}
              onChange={this.handleInputChange}
              value={promoCode}
              autoFocus
              className="form__input form__input-big padding-left-right-smaller margin-left-right-smaller text-size-biggest"
              data-heap-name="ordering.promotion.promotion-input"
              placeholder={t('EnterPromoCodeHere')}
            />
            {showCleanButton ? (
              <button
                onClick={this.handleCleanClick}
                className="ordering-promotion__button-close button flex__shrink-fixed"
                data-heap-name="ordering.promotion.clear-btn"
              >
                <IconClose className="icon icon__big icon__default" />
              </button>
            ) : null}
          </div>
          {Boolean(this.getMessage()) ? (
            <p className="form__error-message margin-smaller text-weight-bolder">{this.getMessage()}</p>
          ) : null}
        </div>

        <footer className="footer padding-small flex flex-middle flex-space-between">
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smallest margin-left-right-smaller text-uppercase text-weight-bolder"
            data-heap-name="ordering.promotion.apply-btn"
            disabled={promoCode === '' || inProcess || isAppliedSuccess}
            onClick={this.handleApplyPromotion}
          >
            {inProcess ? <div className="loader"></div> : t('Apply')}
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
        validFrom: getPromoValidFrom(state),
        promoStatus: getStatus(state),
        isAppliedSuccess: isAppliedSuccess(state),
        isAppliedError: isAppliedError(state),
        inProcess: isInProcess(state),
      };
    },
    dispatch => ({
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
    })
  )
)(Promotion);
