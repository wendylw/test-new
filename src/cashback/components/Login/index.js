import React from 'react';
import PropTypes from 'prop-types';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import Constants from '../../../utils/constants';
import TermsAndPrivacy from '../../../components/TermsAndPrivacy';
import Alert from '../../../common/feedback/alert/Alert';
import ReCAPTCHA, { globalName as RECAPTCHA_GLOBAL_NAME } from '../../../common/components/ReCAPTCHA';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { actions as appActionCreators, getUser } from '../../redux/modules/app';
import config from '../../../config';
import loggly from '../../../utils/monitoring/loggly';
import './LoyaltyLogin.scss';

class Login extends React.Component {
  state = {
    sendOtp: false,
    shouldShowAlert: false,
  };

  captchaRef = React.createRef();

  componentDidUpdate(prevProps) {
    const { user: prevUser } = prevProps;
    const { user: currUser } = this.props;
    const { isOTPError: prevIsOTPError } = prevUser || {};
    const { isOTPError: currIsOTPError } = currUser || {};

    if (!prevIsOTPError && currIsOTPError) {
      this.setState({ shouldShowAlert: true });
    }
  }

  handleCloseOtpModal() {
    const { appActions } = this.props;

    appActions.resetOtpStatus();
  }

  handleUpdateUser(user) {
    const { appActions } = this.props;

    appActions.updateUser(user);
  }

  handleCloseAlert() {
    this.setState({ shouldShowAlert: false });
  }

  async handleCompleteReCAPTCHA() {
    try {
      if (!window[RECAPTCHA_GLOBAL_NAME]) {
        throw new Error('ReCaptcha failed to load');
      }

      const token = await this.captchaRef.current.executeAsync();
      // Reset the recaptcha once the token is retrieved.
      // If we don't reset the captcha manually, the new token won't be generated next time.
      // Ref: https://github.com/dozoisch/react-google-recaptcha/issues/191#issuecomment-715635172
      this.captchaRef.current.reset();

      if (!token) {
        // reCAPTCHA response expires then token will be null.
        throw new Error('ReCaptcha response is expired');
      }

      loggly.log('cashback.otp-login.complete-captcha-success');

      return token;
    } catch (e) {
      this.setState({ shouldShowAlert: true });
      // We will set the attribute 'message' even if it is always empty
      loggly.error('cashback.otp-login.complete-captcha-error', { message: e?.message });
      throw e;
    }
  }

  async handleSubmitPhoneNumber(phone, type) {
    const { appActions } = this.props;
    this.setState({ sendOtp: false });
    loggly.log('cashback.login-attempt');

    try {
      let captchaToken = undefined;
      // Skip reCAPTCHA checking if it is disabled
      if (config.recaptchaEnabled) {
        captchaToken = await this.handleCompleteReCAPTCHA();
      }
      await appActions.getOtp({ phone, captchaToken, type });
      window.newrelic?.addPageAction('cashback.login.get-otp-success');
      this.setState({ sendOtp: true });
    } catch (e) {
      window.newrelic?.addPageAction('cashback.login.get-otp-failed');
    }
  }

  handleCaptchaLoad() {
    const hasLoadSuccess = !!window.grecaptcha;
    const scriptName = 'google-recaptcha';

    window.newrelic?.addPageAction(`cashback.otp-login.script-load-${hasLoadSuccess ? 'success' : 'error'}`, {
      scriptName: scriptName,
    });

    this.setState({ shouldShowAlert: !hasLoadSuccess });
  }

  async handleWebLogin(otp) {
    const { appActions } = this.props;

    await appActions.sendOtp({ otp });

    const { user } = this.props;
    const { accessToken, refreshToken } = user;

    if (accessToken && refreshToken) {
      appActions.loginApp({
        accessToken,
        refreshToken,
      });
    }
  }

  updateOtpStatus() {
    this.props.appActions.updateOtpStatus();
  }

  renderOtpModal() {
    const { user, t } = this.props;
    const { sendOtp } = this.state;
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
        showWhatsAppResendBtn={!noWhatsAppAccount && country === 'MY'}
        onClose={this.handleCloseOtpModal.bind(this)}
        getOtp={this.handleSubmitPhoneNumber.bind(this)}
        sendOtp={this.handleWebLogin.bind(this)}
        updateOtpStatus={this.updateOtpStatus.bind(this)}
        isLoading={isFetching || isLogin}
        isResending={isResending}
        isError={isError}
        shouldCountdown={sendOtp}
      />
    );
  }

  renderReCAPTCHA() {
    // Only load reCAPTCHA script if it is enabled
    if (!config.recaptchaEnabled) {
      return null;
    }

    return (
      <ReCAPTCHA
        sitekey={config.googleRecaptchaSiteKey}
        size="invisible"
        ref={this.captchaRef}
        asyncScriptOnLoad={this.handleCaptchaLoad.bind(this)}
      />
    );
  }

  render() {
    const { shouldShowAlert } = this.state;
    const { user, title, className, t } = this.props;
    const { isFetching, isLogin, phone, country } = user || {};
    const classList = ['login'];

    if (className) {
      classList.push(className);
    }

    if (!isLogin) {
      classList.push('active');
    }

    return (
      <section className={classList.join(' ')} data-heap-name="cashback.login.container">
        <PhoneViewContainer
          className="absolute-wrapper login__container padding-left-right-normal"
          title={title}
          phone={phone}
          country={country}
          buttonText={t('Continue')}
          show={true}
          isLoading={isFetching}
          updatePhoneNumber={this.handleUpdateUser.bind(this)}
          updateCountry={this.handleUpdateUser.bind(this)}
          onSubmit={this.handleSubmitPhoneNumber.bind(this)}
        >
          <p className="terms-privacy text-center text-opacity">
            <TermsAndPrivacy
              buttonLinkClassName="button__default"
              termsOfUseDataHeapName="cashback.login.term-link"
              privacyPolicyDataHeapName="cashback.login.privacy-policy-link"
            />
          </p>
        </PhoneViewContainer>
        {this.renderOtpModal()}
        {this.renderReCAPTCHA()}
        <Alert
          show={shouldShowAlert}
          onClose={this.handleCloseAlert.bind(this)}
          closeButtonContent={t('Dismiss')}
          content={
            <>
              <h4 className="alert__title padding-small text-size-biggest text-weight-bolder">
                {t('NetworkErrorTitle')}
              </h4>
              <div className="alert__description padding-small text-line-height-base">
                {t('NetworkErrorDescription')}
              </div>
            </>
          }
        />
      </section>
    );
  }
}

Login.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
};

Login.defaultProps = {};

Login.displayName = 'CashbackLogin';

export default compose(
  withTranslation('Common'),
  connect(
    state => ({
      user: getUser(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Login);
