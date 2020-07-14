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
      inputContainerStatus = 'has-success';
    } else if (isAppliedError) {
      inputContainerStatus = 'has-error';
    }

    return (
      <section className="table-ordering__promotion" data-heap-name="ordering.promotion.container">
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.promotion.header"
          isPage={true}
          title={t('MyVouchersAndPromos')}
          navFunc={this.handleClickBack}
        ></Header>
        <div className={'promotion-code__input-container ' + inputContainerStatus}>
          <input
            ref={ref => {
              this.promoCodeInput = ref;
            }}
            disabled={isAppliedSuccess || inProcess}
            onChange={this.handleInputChange}
            value={promoCode}
            autoFocus
            className="input input__block"
            data-heap-name="ordering.promotion.promotion-input"
            placeholder={t('EnterPromoCodeHere')}
          />
          {showCleanButton ? (
            <button
              onClick={this.handleCleanClick}
              className="clean__button"
              data-heap-name="ordering.promotion.clear-btn"
            >
              <IconClose />
            </button>
          ) : null}
          <div className="promotion-code__message">{this.getMessage()}</div>
        </div>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-1">
            <button
              className="promotion-apply__button button button__fill button__block text-weight-bolder"
              data-heap-name="ordering.promotion.apply-btn"
              disabled={promoCode === '' || inProcess || isAppliedSuccess}
              onClick={this.handleApplyPromotion}
            >
              {inProcess ? <div className="loader"></div> : t('APPLY')}
            </button>
          </div>
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
