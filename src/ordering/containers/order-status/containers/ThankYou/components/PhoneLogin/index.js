import qs from 'qs';
import React from 'react';
import _isNil from 'lodash/isNil';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Utils from '../../../../../../../utils/utils';
import { actions as appActionCreators, getUser, getBusinessInfo } from '../../../../../../redux/modules/app';
import * as NativeMethods from '../../../../../../../utils/native-methods';
import { getCashbackInfo } from '../../redux/selector';
import { loadCashbackInfo, createCashbackInfo } from '../../redux/thunks';
import './PhoneLogin.scss';
import loggly from '../../../../../../../utils/monitoring/loggly';

class PhoneLogin extends React.Component {
  state = {
    phone: Utils.getLocalStorageVariable('user.p'),
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

  componentDidUpdate(prevProps) {
    const { user, businessInfo } = this.props;
    const { isLogin } = user || {};
    const { enableCashback } = businessInfo || {};
    const { enableCashback: prevEnableCashback } = prevProps.businessInfo || {};
    const canCreateCashback =
      isLogin && enableCashback && (prevEnableCashback !== enableCashback || isLogin !== prevProps.user.isLogin);

    if (canCreateCashback) {
      this.canClaimCheck(user);
    }
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

  render() {
    return null;
  }
}

PhoneLogin.displayName = 'PhoneLogin';

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
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
