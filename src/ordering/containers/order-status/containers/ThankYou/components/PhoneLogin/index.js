/* eslint-disable react/jsx-filename-extension */
/* eslint-disable dot-notation */
/* eslint-disable react/sort-comp */
/* eslint-disable camelcase */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-shadow */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/state-in-constructor */
/* eslint-disable lines-between-class-members */
/* eslint-disable import/no-unresolved */
import qs from 'qs';
import React from 'react';
import _isNil from 'lodash/isNil';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import succeedAnimationGif from '../../../../../../../images/succeed-animation.gif';
import Utils from '../../../../../../../utils/utils';
import CurrencyNumber from '../../../../../../components/CurrencyNumber';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getUser,
  getBusinessInfo,
} from '../../../../../../redux/modules/app';
import * as NativeMethods from '../../../../../../../utils/native-methods';
import { getCashbackInfo } from '../../redux/selector';
import { loadCashbackInfo, createCashbackInfo } from '../../redux/thunks';
import './PhoneLogin.scss';
import loggly from '../../../../../../../utils/monitoring/loggly';

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
    const { history, loadCashbackInfo, appActions } = this.props;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    await loadCashbackInfo(receiptNumber);

    const { user, businessInfo } = this.props;
    const { enableCashback } = businessInfo || {};

    if (enableCashback) {
      this.canClaimCheck(user);
    }

    this.initMessages();

    this.setState({
      claimedAnimationGifSrc: succeedAnimationGif,
    });

    if (Utils.isWebview()) {
      const res = await NativeMethods.getTokenAsync();
      if (_isNil(res)) {
        loggly.error('order-status.thank-you.phone-login', { message: 'native token is invalid' });
      } else {
        const { access_token, refresh_token } = res;
        await appActions.loginApp({
          accessToken: access_token,
          refreshToken: refresh_token,
        });
      }
    }
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
    // eslint-disable-next-line react/destructuring-assignment
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
    // HideMessage is passed in as props, and its value is always true. In the future, the logic for loading data will be removed, and the entire control will no longer be used and deleted
    return null;
  }
}
PhoneLogin.displayName = 'PhoneLogin';

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
