import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import PhoneView from '../../../../../components/PhoneView';
import CurrencyNumber from '../../../../components/CurrencyNumber';

import qs from 'qs';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo, getUser } from '../../../../redux/modules/app';
import { actions as thankYouActions, getBusinessInfo, getCashbackInfo } from '../../../../redux/modules/thankYou';

const ORDER_CAN_CLAIM = 'Can_Claim';
const ANIMATION_TIME = 3600;
const CLAIMED_ANIMATION_GIF = '/img/succeed-animation.gif';

class PhoneViewContainer extends React.Component {
  MESSAGES = {};
  animationSetTimeout = null;

  state = {
    phone: Utils.getLocalStorageVariable('user.p'),
    isSavingPhone: false,
    redirectURL: null,
    showCelebration: false,
    claimedAnimationGifSrc: null
  }

  async componentWillMount() {
    const {
      history,
      thankYouActions,
    } = this.props;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    this.initMessages();

    await thankYouActions.getCashbackInfo(receiptNumber);

    const { cashbackInfo, user } = this.props;

    this.canClaimCheck(cashbackInfo, user);
    this.setLoyaltyPageUrl(user.isLogin);
  }

  componentWillReceiveProps(nextProps) {
    const { cashbackInfo, user } = nextProps;
    const { isLogin } = user;

    if (this.props.user.isLogin === isLogin) {
      return;
    }

    this.canClaimCheck(cashbackInfo, user);
    this.setLoyaltyPageUrl(isLogin);
  }

  componentDidMount() {
    this.setState({
      claimedAnimationGifSrc: CLAIMED_ANIMATION_GIF
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.showCelebration && nextState.redirectURL) {
      this.animationSetTimeout = setTimeout(() => {
        this.setState({ showCelebration: false });

        clearTimeout(this.animationSetTimeout);
      }, ANIMATION_TIME);
    }
  }

  initMessages() {
    const { businessInfo } = this.props;
    const { claimCashbackCountPerDay } = businessInfo || {};
    const messages = {
      Default: 'Oops, please scan QR to claim again.',
      /* get Cash Back messages */
      Invalid: 'After your purchase, just scan your receipt and enter your mobile number to earn cashback for your next visit. It’s that simple!',
      /* save Cash Back messages */
      Claimed_FirstTime: {
        title: `Awesome, you've earned your first cashback! 🎉 `,
        description: `Tap the button below to learn how to use your cashback.`,
      },
      Claimed_NotFirstTime: {
        title: `You've earned more cashback! 🎉`,
      },
      Claimed_Processing: `You've earned more cashback! We'll add it once it's been processed.😉`,
      Claimed_Someone_Else: `Someone else has already earned cashback for this receipt.😅`,
      Claimed_Repeat: `You've already earned cashback for this receipt.👍`,
      NotClaimed: 'Looks like something went wrong. Please scan the QR again, or ask the staff for help.',
      NotClaimed_Expired: `This cashback has expired and cannot be earned anymore.😭`,
      NotClaimed_Cancelled: 'This transaction has been cancelled/refunded.',
      NotClaimed_ReachLimit: `Oops, you've exceeded your cashback limit for today. The limit is ${claimCashbackCountPerDay || 0} time(s) a day. 😭`,
      /* set Otp */
      NotSent_OTP: 'Oops! OTP not sent, please check your phone number and send again.',
      /* verify phone */
      Save_Cashback_Failed: 'Oops! please retry again later.',
      /* Activity */
      Activity_Incorrect: 'Activity incorrect, need retry.',
    }

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

  canClaimCheck(cashbackInfo, user) {
    const { status } = cashbackInfo || {};
    const { isLogin } = user || {};
    const canClaim = status === ORDER_CAN_CLAIM;

    if (isLogin) {
      this.handleCreateCustomerCashbackInfo();
    }

    this.setState({ showCelebration: canClaim && isLogin });
  }

  async setLoyaltyPageUrl(isLogin) {
    const { appActions } = this.props;

    if (!isLogin) {
      return;
    }

    await appActions.loadCustomerProfile();

    const { user } = this.props;
    const { customerId } = user || {};
    let redirectURL = null;

    if (customerId) {
      redirectURL = `${Constants.ROUTER_PATHS.CASHBACK_BASE}${Constants.ROUTER_PATHS.CASHBACK_HOME}?customerId=${customerId}`;
    }

    this.setState({
      redirectURL,
    });
  }

  getOrderInfo() {
    const { history } = this.props;
    const { phone } = this.state;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return {
      phone,
      receiptNumber,
      source: Constants.CASHBACK_SOURCE.QR_ORDERING
    };
  }

  async handleCreateCustomerCashbackInfo() {
    const { thankYouActions } = this.props;
    const { phone } = this.state;

    Utils.setLocalStorageVariable('user.p', phone);
    await thankYouActions.createCashbackInfo(this.getOrderInfo());
  }

  handleUpdatePhoneNumber(phone) {
    this.setState({ phone });
  }

  handleSubmitPhoneNumber() {
    const { appActions } = this.props;
    const { phone } = this.state;

    appActions.getOtp({ phone });
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

    return (
      <CurrencyNumber
        className="font-weight-bold"
        money={Math.abs(cashback || 0)}
      />
    );
  }

  renderPhoneView() {
    const {
      user,
      onlineStoreInfo,
    } = this.props;
    const {
      redirectURL,
      phone,
    } = this.state;
    const {
      isFetching,
      isWebview,
      isLogin,
    } = user || {};
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

    if (!redirectURL && !isWebview) {
      return null;
    }

    return !isWebview
      ? (
        <BrowserRouter basename="/">
          <Link
            className="button__fill link__non-underline link__block border-radius-base font-weight-bold text-uppercase"
            to={redirectURL}
            target="_blank"
          >Check My Balance</Link>
        </BrowserRouter>
      )
      : (
        <button
          className="button__fill button__block border-radius-base font-weight-bold text-uppercase"
          onClick={this.handlePostLoyaltyPageMessage.bind(this)}
        >Check My Balance</button>
      );
  }

  render() {
    const {
      cashbackInfo,
      businessInfo,
      onlineStoreInfo,
    } = this.props;
    const {
      claimedAnimationGifSrc,
      showCelebration,
      redirectURL,
    } = this.state;
    const { cashback } = cashbackInfo || {};
    const { country } = onlineStoreInfo || {};
    const { enableCashback } = businessInfo || {};

    if (!country || !cashback || !enableCashback) {
      return null;
    }

    return (
      <div className="thanks__phone-view">
        <label className="phone-view-form__label text-center">
          {this.getMessage() || ''}
        </label>
        {this.renderPhoneView()}

        <p className="terms-privacy text-center gray-font-opacity">
          By tapping to continue, you agree to our
          <br />
          <BrowserRouter basename="/">
            <Link target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}><strong>Terms of Service</strong></Link>, and <Link target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}><strong>Privacy Policy</strong></Link>.
          </BrowserRouter>
        </p>
        <div className={`succeed-animation ${showCelebration && redirectURL ? 'active' : ''}`}>
          <img src={claimedAnimationGifSrc} alt="Beep Claimed" />
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    user: getUser(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    businessInfo: getBusinessInfo(state),
    cashbackInfo: getCashbackInfo(state),
  }),
  (dispatch) => ({
    appActions: bindActionCreators(appActions, dispatch),
    thankYouActions: bindActionCreators(thankYouActions, dispatch),
  })
)(PhoneViewContainer);