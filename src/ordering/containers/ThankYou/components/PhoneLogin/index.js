import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import PhoneView from '../../../../../components/PhoneView';
import CurrencyNumber from '../../../../components/CurrencyNumber';

import qs from 'qs';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActionCreators, getOnlineStoreInfo, getUser } from '../../../../redux/modules/app';
import {
  actions as thankYouActionCreators,
  getBusinessInfo,
  getCashbackInfo,
} from '../../../../redux/modules/thankYou';

const ORDER_CLAIMED_SUCCESSFUL = ['Claimed_FirstTime', 'Claimed_NotFirstTime'];
const ANIMATION_TIME = 3600;
const CLAIMED_ANIMATION_GIF = '/img/succeed-animation.gif';

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
      claimedAnimationGifSrc: CLAIMED_ANIMATION_GIF,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { showCelebration } = this.state;
    const { user, businessInfo } = this.props;
    const { isLogin } = user || {};
    const { enableCashback } = businessInfo || {};
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
  }

  componentWillUnmount() {
    clearTimeout(this.animationSetTimeout);
  }

  initMessages() {
    const { businessInfo, onlineStoreInfo, cashbackInfo } = this.props;
    const { claimCashbackCountPerDay } = businessInfo || {};
    const { currencySymbol } = onlineStoreInfo || {};
    const { cashback } = cashbackInfo || {};
    const messages = {
      Default: 'Oops, please scan QR to claim again.',
      /* get Cash Back messages */
      Invalid:
        'After your purchase, just scan your receipt and enter your mobile number to earn cashback for your next visit. It’s that simple!',
      /* save Cash Back messages */
      Claimed_FirstTime: `Awesome, you've earned ${currencySymbol || ''} ${cashback || ''} your first cashback! 🎉 `,
      Claimed_NotFirstTime: `You've earned ${currencySymbol || ''} ${cashback || ''} cashback! 🎉`,
      Claimed_Processing: `You've earned more cashback! We'll add it once it's been processed.😉`,
      Claimed_Someone_Else: `Someone else has already earned cashback for this receipt.😅`,
      Claimed_Repeat: `You've already earned cashback for this receipt.👍`,
      NotClaimed: 'Looks like something went wrong. Please scan the QR again, or ask the staff for help.',
      NotClaimed_Expired: `This cashback has expired and cannot be earned anymore.😭`,
      NotClaimed_Cancelled: 'This transaction has been cancelled/refunded.',
      NotClaimed_ReachLimit: `Oops, you've exceeded your cashback limit for today. The limit is ${claimCashbackCountPerDay ||
        0} time(s) a day. 😭`,
      NotClaimed_ReachMerchantLimit:
        'Sorry, Your transaction is pending, you will receive a SMS confirmation once your cashback is processed.',
      /* set Otp */
      NotSent_OTP: 'Oops! OTP not sent, please check your phone number and send again.',
      /* verify phone */
      Save_Cashback_Failed: 'Oops! please retry again later.',
      /* Activity */
      Activity_Incorrect: 'Activity incorrect, need retry.',
    };

    this.MESSAGES = messages;
  }

  getMessage() {
    const { user, cashbackInfo } = this.props;
    const { isLogin } = user || {};
    const { status: key } = cashbackInfo || {};

    if (!key || !isLogin) {
      return 'Claim with your mobile number';
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

    alert('start request');

    // appActions.getOtp({ phone }); use when otp will fixed
    appActions.phoneNumberLogin({ phone });

    alert('end request');
  }

  handlePostLoyaltyPageMessage() {
    const { user } = this.props;
    const { isWebview } = user;

    if (isWebview) {
      window.ReactNativeWebView.postMessage('goToLoyaltyPage');
    }

    return;
  }

  renderCurrencyNumber() {
    const { cashbackInfo } = this.props;
    const { cashback } = cashbackInfo || {};

    if (!cashback) {
      return null;
    }

    return <CurrencyNumber className="font-weight-bold" money={Math.abs(cashback || 0)} />;
  }

  renderPhoneView() {
    const { user, onlineStoreInfo } = this.props;
    const { phone } = this.state;
    const { isFetching, isWebview, isLogin, customerId } = user || {};
    const { country } = onlineStoreInfo || {};

    if (!isLogin) {
      return (
        <PhoneView
          phone={phone}
          country={country}
          setPhone={this.handleUpdatePhoneNumber.bind(this)}
          submitPhoneNumber={this.handleSubmitPhoneNumber.bind(this)}
          isLoading={isFetching}
          buttonText="Continue"
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
            className="button__fill link__non-underline link__block border-radius-base font-weight-bold text-uppercase"
            to={`${Constants.ROUTER_PATHS.CASHBACK_BASE}${Constants.ROUTER_PATHS.CASHBACK_HOME}?customerId=${customerId}`}
            target="_blank"
          >
            Check My Balance
          </Link>
        </BrowserRouter>
      );
    }

    return (
      <button
        className="button__fill button__block border-radius-base font-weight-bold text-uppercase"
        onClick={this.handlePostLoyaltyPageMessage.bind(this)}
      >
        Check My Balance
      </button>
    );
  }

  render() {
    const { user, businessInfo, onlineStoreInfo } = this.props;
    const { claimedAnimationGifSrc, showCelebration } = this.state;
    const { customerId } = user || {};
    const { country } = onlineStoreInfo || {};
    const { enableCashback } = businessInfo || {};

    if (!country || !enableCashback) {
      return null;
    }

    return (
      <div className="thanks__phone-view">
        <label className="phone-view-form__label text-center">{this.getMessage() || ''}</label>
        {this.renderPhoneView()}

        <p className="terms-privacy text-center gray-font-opacity">
          By tapping to continue, you agree to our
          <br />
          <BrowserRouter basename="/">
            <Link target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}>
              <strong>Terms of Service</strong>
            </Link>
            , and{' '}
            <Link target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}>
              <strong>Privacy Policy</strong>
            </Link>
            .
          </BrowserRouter>
        </p>
        <div className={`succeed-animation ${showCelebration && customerId ? 'active' : ''}`}>
          <img src={claimedAnimationGifSrc} alt="Beep Claimed" />
        </div>
      </div>
    );
  }
}

export default connect(
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
)(PhoneLogin);
