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
  animationSetTimeout = null;

  state = {
    phone: Utils.getLocalStorageVariable('user.p'),
    isSavingPhone: false,
    redirectURL: null,
    showCelebration: true,
    claimedAnimationGifSrc: null
  }

  async componentWillMount() {
    const {
      history,
      thankYouActions,
    } = this.props;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    await thankYouActions.getCashbackInfo(receiptNumber);

    const { cashbackInfo, user } = this.props;

    this.canClaimCheck(cashbackInfo, user);
  }

  componentWillReceiveProps(nextProps) {
    const { cashbackInfo, user } = nextProps;
    const { isLogin } = user;

    if (this.props.user.isLogin === isLogin) {
      return;
    }

    this.canClaimCheck(cashbackInfo, user);
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

  canClaimCheck(cashbackInfo, user) {
    const { status } = cashbackInfo || {};
    const { isLogin } = user || {};
    const canClaim = status === ORDER_CAN_CLAIM;

    if (canClaim && isLogin) {
      this.setState({ showCelebration: true });
      this.handleCreateCustomerCashbackInfo();
    }
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
    let redirectURL = null;

    Utils.setLocalStorageVariable('user.p', phone);
    await thankYouActions.createCashbackInfo(this.getOrderInfo());

    const { cashbackInfo } = this.props;
    const { customerId } = cashbackInfo || {};

    if (customerId) {
      redirectURL = `${Constants.ROUTER_PATHS.CASHBACK_BASE}${Constants.ROUTER_PATHS.CASHBACK_HOME}?customerId=${customerId}`;
    }

    this.setState({
      redirectURL,
    });
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
      user,
      cashbackInfo,
      businessInfo,
      onlineStoreInfo,
    } = this.props;
    const {
      claimedAnimationGifSrc,
      showCelebration,
      redirectURL,
    } = this.state;
    const {
      cashback,
      status
    } = cashbackInfo || {};
    const { isLogin } = user || {};
    const { country } = onlineStoreInfo || {};
    const { enableCashback } = businessInfo || {};

    if (!country || !cashback || !enableCashback) {
      return null;
    }

    return (
      <div className="thanks__phone-view">
        {
          status !== ORDER_CAN_CLAIM || isLogin
            ? (
              <label className="phone-view-form__label text-center">
                You’ve earned {this.renderCurrencyNumber()} Cashback!
							</label>
            )
            : (
              <label className="phone-view-form__label text-center">
                Earn {this.renderCurrencyNumber()} Cashback with Your Mobile Number
							</label>
            )
        }
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