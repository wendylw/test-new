import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import TermsAndPrivacy from '../../../components/TermsAndPrivacy';
import Constants from '../../../utils/constants';
import HybridHeader from '../../../components/HybridHeader';
import PageLoader from '../../../components/PageLoader';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { actions as appActionCreators, getUser, getOtpType, getDeliveryDetails } from '../../redux/modules/app';
import beepLoginDisabled from '../../../images/beep-login-disabled.png';
import beepLoginActive from '../../../images/beep-login-active.svg';
import './OrderingPageLogin.scss';
import loggly from '../../../utils/monitoring/loggly';
import Utils from '../../../utils/utils';
import config from '../../../config';
import _isObject from 'lodash/isObject';
import _includes from 'lodash/includes';

class PageLogin extends React.Component {
  state = {
    sendOtp: false,
  };

  componentDidMount() {
    if (Utils.isTNGMiniProgram()) {
      this.loginInTngMiniProgram();
    }
  }

  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isLogin } = user || {};
    const { sendOtp } = this.state;
    if (sendOtp && this.props.user.isLogin && isLogin !== this.props.user.isLogin) {
      this.visitNextPage();
    }
  }

  visitNextPage = async () => {
    const { history, location } = this.props;
    const { redirectLocation } = location.state || {};

    if (redirectLocation) {
      // RedirectLocation is a Location object
      if (_isObject(redirectLocation)) {
        history.replace(redirectLocation);
        return;
      }

      // Different origin when before and after redirect
      const redirectUrl = new URL(redirectLocation, window.location.origin);
      if (redirectUrl.origin !== window.location.origin) {
        window.location.replace(redirectLocation);
        return;
      }

      history.replace(redirectLocation);

      return;
    }

    this.goBack();
  };

  handleCloseOtpModal() {
    const { appActions } = this.props;

    appActions.resetOtpStatus();
  }

  handleUpdateUser(user) {
    const { appActions } = this.props;

    appActions.updateUser(user);
  }

  handleSubmitPhoneNumber(phone, type) {
    const { appActions } = this.props;
    loggly.log('page-login.login-attempt');
    window.newrelic?.addPageAction('ordering.login.get-otp-start');
    appActions.getOtp({ phone, type });
    this.setState({ sendOtp: true });
  }

  updateOtpStatus() {
    this.props.appActions.updateOtpStatus();
  }

  async handleWebLogin(otp) {
    const { appActions } = this.props;

    window.newrelic?.addPageAction('ordering.login.verify-otp-start');
    await appActions.sendOtp({ otp });

    const { user } = this.props;
    const { accessToken, refreshToken } = user;

    if (accessToken && refreshToken) {
      window.newrelic?.addPageAction('ordering.login.verify-otp-done');
      appActions.loginApp({
        accessToken,
        refreshToken,
      });
    }
  }

  goBack = () => {
    const { history, location } = this.props;
    const { shouldGoBack } = location.state || {};

    if (shouldGoBack) {
      history.goBack();
      return;
    }

    // Default route
    history.replace({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      search: window.location.search,
    });
  };

  loginInTngMiniProgram = async () => {
    const { appActions } = this.props;
    const isLogin = await appActions.loginByTngMiniProgram();

    if (!isLogin) {
      this.goBack();
      return;
    }

    this.visitNextPage();
  };

  renderOtpModal() {
    const { t, user } = this.props;
    const { isFetching, isResending, isLogin, hasOtp, isError, phone, noWhatsAppAccount, country } = user || {};
    const { RESEND_OTP_TIME } = Constants;

    if (!hasOtp || isLogin) {
      return null;
    }

    return (
      <OtpModal
        buttonText={t('OK')}
        ResendOtpTime={RESEND_OTP_TIME}
        phone={phone}
        country={country}
        showWhatsAppResendBtn={!noWhatsAppAccount && country === 'MY'}
        onClose={this.handleCloseOtpModal.bind(this)}
        getOtp={this.handleSubmitPhoneNumber.bind(this)}
        sendOtp={this.handleWebLogin.bind(this)}
        updateOtpStatus={this.updateOtpStatus.bind(this)}
        isLoading={isFetching || isLogin}
        isResending={isResending}
        isError={isError}
      />
    );
  }

  render() {
    const { t, user, className } = this.props;
    const { isLogin, showLoginPage, hasOtp, isFetching, phone, country } = user || {};
    const classList = ['page-login flex flex-column'];

    if (Utils.isTNGMiniProgram()) {
      return <PageLoader />;
    }

    if (isLogin) {
      return null;
    }

    if (className) {
      classList.push(className);
    }

    if (hasOtp || showLoginPage) {
      classList.push('active');
    }

    return (
      <React.Fragment>
        <section className={classList.join(' ')} data-heap-name="ordering.login.container">
          <HybridHeader
            className="flex-middle"
            contentClassName="flex-middle"
            data-heap-name="ordering.login.header"
            title="Login or Create Account"
            isPage={true}
            navFunc={this.goBack}
          />
          <div className="page-login__container">
            <figure className="page-login__image-container padding-top-bottom-normal margin-top-bottom-small">
              <img
                src={beepLoginActive}
                alt="otp active"
                className={`${isValidPhoneNumber(phone || '') ? '' : 'page-login__icon--hide'}`}
              />
              <img
                src={beepLoginDisabled}
                alt="otp disabled"
                className={`${isValidPhoneNumber(phone || '') ? 'page-login__icon--hide' : 'page-login__disabled'}`}
              />
            </figure>
            <PhoneViewContainer
              className="padding-normal margin-normal"
              phone={phone}
              content={t('LoginTip')}
              country={country}
              buttonText={t('Continue')}
              show={true}
              isLoading={isFetching}
              updatePhoneNumber={this.handleUpdateUser.bind(this)}
              updateCountry={this.handleUpdateUser.bind(this)}
              onSubmit={this.handleSubmitPhoneNumber.bind(this)}
            ></PhoneViewContainer>
          </div>
          <p className="text-center margin-top-bottom-small text-line-height-base text-opacity">
            <TermsAndPrivacy buttonLinkClassName="page-login__button-link" />
          </p>
        </section>
        {this.renderOtpModal()}
      </React.Fragment>
    );
  }
}
PageLogin.displayName = 'PageLogin';

PageLogin.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
};

PageLogin.defaultProps = {
  title: '',
};

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      deliveryDetails: getDeliveryDetails(state),
      otpType: getOtpType(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(PageLogin);
