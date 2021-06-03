import qs from 'qs';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getAppToken } from '../../../../../../../cashback/containers/utils';
import succeedAnimationGif from '../../../../../../../images/succeed-animation.gif';
import Constants from '../../../../../../../utils/constants';
import Utils from '../../../../../../../utils/utils';
import CurrencyNumber from '../../../../../../components/CurrencyNumber';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getUser,
  getBusinessInfo,
} from '../../../../../../redux/modules/app';
import { getCashbackInfo } from '../../redux/selector';
import { loadCashbackInfo, createCashbackInfo } from '../../redux/thunks';
import './PhoneLogin.scss';

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

  constructor(props) {
    super(props);
    window.sendToken = res => this.authTokens(res);
  }

  authTokens = async res => {
    if (res) {
      if (Utils.isIOSWebview()) {
        await this.loginBeepApp(res);
      } else if (Utils.isAndroidWebview()) {
        const data = JSON.parse(res) || {};
        await this.loginBeepApp(data);
      }
    }
  };

  loginBeepApp = async res => {
    const { appActions } = this.props;
    if (res.access_token && res.refresh_token) {
      await appActions.loginApp({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
      });
    }
  };

  async componentDidMount() {
    const { history, loadCashbackInfo } = this.props;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    await loadCashbackInfo(receiptNumber);

    const { user, businessInfo } = this.props;
    const { isWebview, isLogin } = user || {};
    const { enableCashback } = businessInfo || {};

    if (!isLogin && isWebview) {
      getAppToken(user);
    }

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
    const { createCashbackInfo } = this.props;
    const { phone } = this.state;
    const { isLogin } = user || {};
    const { isFetching, createdCashbackInfo } = this.props.cashbackInfo || {};

    if (isLogin) {
      Utils.setLocalStorageVariable('user.p', phone);
    }

    if (isLogin && !isFetching && !createdCashbackInfo) {
      await createCashbackInfo(this.getOrderInfo());
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
      receiptNumber,
      phone,
    };
  }

  handleUpdatePhoneNumber(phone) {
    this.setState({ phone });
  }

  renderCurrencyNumber() {
    const { cashbackInfo } = this.props;
    const { cashback } = cashbackInfo || {};

    if (!cashback) {
      return null;
    }

    return <CurrencyNumber className="text-weight-bolder" money={Math.abs(cashback || 0)} />;
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
      <div className="phone-login padding-normal" data-heap-name="ordering.thank-you.phone-login.container">
        <div
          className={`ordering-thanks__card-prompt-congratulation absolute-wrapper ${
            showCelebration && customerId ? 'active' : ''
          }`}
        >
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
      loadCashbackInfo: bindActionCreators(loadCashbackInfo, dispatch),
      createCashbackInfo: bindActionCreators(createCashbackInfo, dispatch),
    })
  )
)(PhoneLogin);
