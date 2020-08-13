import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import PhoneView from '../../../../../components/PhoneView';
import CurrencyNumber from '../../../../components/CurrencyNumber';

import qs from 'qs';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getOnlineStoreInfo, getUser } from '../../../../redux/modules/app';
import {
  actions as thankYouActionCreators,
  getBusinessInfo,
  getCashbackInfo,
} from '../../../../redux/modules/thankYou';

import succeedAnimationGif from '../../../../../images/succeed-animation.gif';

const ORDER_CLAIMED_SUCCESSFUL = ['Claimed_FirstTime', 'Claimed_NotFirstTime'];
const CASHBACK_ZERO_CLAIMED = [...ORDER_CLAIMED_SUCCESSFUL, 'Claimed_Repeat'];
const ANIMATION_TIME = 3600;

class PhoneLogin extends React.Component {
  MESSAGES = {};
  animationSetTimeout = null;

  state = {
    phone: Utils.getLocalStorageVariable('user.p'),
    isSavingPhone: false,
    showCelebration: false,
    claimedAnimationGifSrc: null,
  };

  async componentDidMount() {
    const { history, thankYouActions } = this.props;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    await thankYouActions.getCashbackInfo(receiptNumber);

    const { user, businessInfo } = this.props;
    const { enableCashback } = businessInfo || {};

    if (enableCashback) {
      this.canClaimCheck(user);
    }

    this.initMessages();

    this.setState({
      claimedAnimationGifSrc: succeedAnimationGif,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { showCelebration } = this.state;
    const { user, businessInfo, onlineStoreInfo } = this.props;
    const { isLogin } = user || {};
    const { enableCashback } = businessInfo || {};
    const { currencySymbol } = onlineStoreInfo || {};
    const { currencySymbol: prevCurrencySymbol } = prevProps.onlineStoreInfo || {};
    const { enableCashback: prevEnableCashback } = prevProps.businessInfo || {};
    const canCreateCashback =
      isLogin && enableCashback && (prevEnableCashback !== enableCashback || isLogin !== prevProps.user.isLogin);

    if (canCreateCashback) {
      this.canClaimCheck(user);
    }

    if (showCelebration && showCelebration !== prevState.showCelebration) {
      this.animationSetTimeout = setTimeout(() => {
        this.setState({ showCelebration: false });

        clearTimeout(this.animationSetTimeout);
      }, ANIMATION_TIME);
    }

    if (currencySymbol && prevCurrencySymbol !== currencySymbol) {
      this.initMessages();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.animationSetTimeout);
  }

  initMessages() {
    const { t, businessInfo, onlineStoreInfo, cashbackInfo } = this.props;
    const { claimCashbackCountPerDay } = businessInfo || {};
    const { currencySymbol } = onlineStoreInfo || {};
    const { cashback } = cashbackInfo || {};
    const messages = {
      Default: t('DefaultMessage'),
      /* get Cash Back messages */
      Invalid: t('InvalidMessage'),
      /* save Cash Back messages */
      Claimed_FirstTime: t('ClaimedFirstTimeTitleInThankYou', {
        currencySymbol: currencySymbol || '',
        cashback: cashback || '',
      }),
      Claimed_NotFirstTime: t('ClaimedNotFirstTimeTitleInThankYou', {
        currencySymbol: currencySymbol || '',
        cashback: cashback || '',
      }),
      Claimed_Processing: t('ClaimedProcessing'),
      Claimed_Someone_Else: t('ClaimedSomeoneElse'),
      Claimed_Repeat: t('ClaimedRepeat'),
      NotClaimed: t('NotClaimed'),
      NotClaimed_Expired: t('NotClaimedExpired'),
      NotClaimed_Cancelled: t('NotClaimedCancelled'),
      NotClaimed_ReachLimit: t('NotClaimedReachLimit', { claimCashbackCountPerDay: claimCashbackCountPerDay || 0 }),
      NotClaimed_ReachMerchantLimit: t('NotClaimedReachMerchantLimit'),
      /* set Otp */
      NotSent_OTP: t('NotSentOTP'),
      /* verify phone */
      Save_Cashback_Failed: t('SaveCashbackFailed'),
      /* Activity */
      Activity_Incorrect: t('ActivityIncorrect'),
    };

    this.MESSAGES = messages;
  }

  getMessage() {
    const { user, cashbackInfo, onlineStoreInfo, t } = this.props;
    const { currencySymbol } = onlineStoreInfo || {};
    const { isLogin } = user || {};
    const { status: key, cashback } = cashbackInfo || {};

    if (!key || !isLogin) {
      /* change messages for no session scenario */
      // return 'Claim with your mobile number';
      // return `Earn ${currencySymbol || ''} ${cashback || ''}  CashBack with your Mobile Number`;
      return t('EarnClaimCashbackTitle', { currencySymbol: currencySymbol || '', cashback: cashback || '' });
    }
    /* if cashback is zero, hide the cashback tip */
    const isCashbackZero = parseFloat(cashback) === 0;
    if (isCashbackZero && CASHBACK_ZERO_CLAIMED.includes(key)) {
      return '';
    }

    if (isLogin) {
      return this.MESSAGES['Claimed_NotFirstTime'];
    }

    return this.MESSAGES[key] || this.MESSAGES.Default;
  }

  async canClaimCheck(user) {
    const { thankYouActions } = this.props;
    const { phone } = this.state;
    const { isLogin } = user || {};
    const { isFetching, createdCashbackInfo } = this.props.cashbackInfo || {};

    if (isLogin) {
      Utils.setLocalStorageVariable('user.p', phone);
    }

    if (isLogin && !isFetching && !createdCashbackInfo) {
      await thankYouActions.createCashbackInfo(this.getOrderInfo());
    }

    const { cashbackInfo } = this.props;
    const { status } = cashbackInfo || {};

    this.setState({ showCelebration: ORDER_CLAIMED_SUCCESSFUL.includes(status) && isLogin });
  }

  getOrderInfo() {
    const { history } = this.props;
    const { phone } = this.state;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return {
      phone,
      receiptNumber,
      source: Constants.CASHBACK_SOURCE.QR_ORDERING,
    };
  }

  handleUpdatePhoneNumber(phone) {
    this.setState({ phone });
  }

  handleSubmitPhoneNumber() {
    const { appActions } = this.props;
    const { phone } = this.state;

    // appActions.getOtp({ phone }); use when otp will fixed
    appActions.phoneNumberLogin({ phone });
  }

  // handlePostLoyaltyPageMessage() {
  //   const { user } = this.props;
  //   const { isWebview } = user;

  //   if (isWebview) {
  //     window.ReactNativeWebView.postMessage('goToLoyaltyPage');
  //   }

  //   return;
  // }

  renderCurrencyNumber() {
    const { cashbackInfo } = this.props;
    const { cashback } = cashbackInfo || {};

    if (!cashback) {
      return null;
    }

    return <CurrencyNumber className="font-weight-bolder" money={Math.abs(cashback || 0)} />;
  }

  renderPhoneView() {
    const { t, user, onlineStoreInfo } = this.props;
    const { phone } = this.state;
    const { isFetching, isWebview, isLogin, customerId } = user || {};
    const { country } = onlineStoreInfo || {};

    if (isLogin) {
      return null;
    }

    if (!isLogin) {
      return (
        <PhoneView
          phone={phone}
          country={country}
          setPhone={this.handleUpdatePhoneNumber.bind(this)}
          submitPhoneNumber={this.handleSubmitPhoneNumber.bind(this)}
          isLoading={isFetching}
          buttonText={t('Continue')}
        />
      );
    }

    if (!customerId && !isWebview) {
      return null;
    }

    if (!isWebview) {
      return (
        <BrowserRouter basename="/">
          <Link
            className="button__fill link__non-underline link__block border-radius-base font-weight-bolder text-uppercase"
            to={`${Constants.ROUTER_PATHS.CASHBACK_BASE}${Constants.ROUTER_PATHS.CASHBACK_HOME}?customerId=${customerId}`}
            data-heap-name="ordering.thank-you.phone-login.check-balance-link"
            target="_blank"
          >
            {t('CheckMyBalance')}
          </Link>
        </BrowserRouter>
      );
    }

    return (
      <button
        className="button__fill button__block border-radius-base font-weight-bolder text-uppercase"
        data-heap-name="ordering.thank-you.phone-login.check-balance-btn"
        onClick={() => {} /* this.handlePostLoyaltyPageMessage.bind(this) */}
      >
        {t('CheckMyBalance')}
      </button>
    );
  }

  render() {
    const { user, businessInfo, onlineStoreInfo, cashbackInfo, hideMessage } = this.props;
    const { claimedAnimationGifSrc, showCelebration } = this.state;
    const { customerId } = user || {};
    const { country } = onlineStoreInfo || {};
    const { enableCashback } = businessInfo || {};
    const { defaultLoyaltyRatio } = cashbackInfo || {};

    if (!country || !enableCashback || defaultLoyaltyRatio === 0 || hideMessage) {
      return null;
    }

    return (
      <div className="thanks__phone-view" data-heap-name="ordering.thank-you.phone-login.container">
        {/*<label className="phone-view-form__label text-center">{this.getMessage() || ''}</label>*/}
        {/*{this.renderPhoneView()}*/}

        {/* <p className="terms-privacy text-center gray-font-opacity">
          <Trans i18nKey="TermsAndPrivacyDescription">
            By tapping to continue, you agree to our
            <br />
            <BrowserRouter basename="/">
              <Link className="font-weight-bolder" target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}>
                Terms of Service
              </Link>
              , and{' '}
              <Link className="font-weight-bolder" target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}>
                Privacy Policy
              </Link>
              .
            </BrowserRouter>
          </Trans>
        </p> */}
        <div className={`succeed-animation ${showCelebration && customerId ? 'active' : ''}`}>
          <img src={claimedAnimationGifSrc} alt="Beep Claimed" />
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      businessInfo: getBusinessInfo(state),
      cashbackInfo: getCashbackInfo(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(PhoneLogin);
