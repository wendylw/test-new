import React from 'react';
import PropTypes from 'prop-types';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import Constants from '../../../utils/constants';
import TermsAndPrivacy from '../../../components/TermsAndPrivacy';
import ReCAPTCHA, { globalName as RECAPTCHA_GLOBAL_NAME } from '../../../common/components/ReCAPTCHA';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import {
  actions as appActionCreators,
  getUser,
  getShouldShowLoader,
  getOtpErrorTextI18nKey,
  getOtpErrorPopUpI18nKeys,
  getShouldShowErrorPopUp,
  getIsLoginRequestFailed,
  getIsOtpRequestStatusPending,
  getIsOtpRequestStatusRejected,
  getIsOtpErrorFieldVisible,
  getIsOtpInitialRequestFailed,
} from '../../redux/modules/app';
import config from '../../../config';
import logger from '../../../utils/monitoring/logger';
import { alert } from '../../../common/utils/feedback';
import './LoyaltyLogin.scss';

const { OTP_REQUEST_TYPES, RESEND_OTP_TIME } = Constants;

class Login extends React.Component {
  state = {
    sendOtp: false,
    shouldShowModal: false,
  };

  captchaRef = React.createRef();

  handleCloseOtpModal() {
    const { appActions } = this.props;

    this.setState({ shouldShowModal: false }, () => appActions.resetSendOtpRequest());
  }

  handleChangeOtpCode() {
    const { isLoginRequestFailed, appActions } = this.props;

    if (!isLoginRequestFailed) return;

    // Only update create otp status when needed
    appActions.resetSendOtpRequest();
  }

  handleUpdateUser(user) {
    const { appActions, isOtpRequestFailed } = this.props;

    appActions.updateUser(user);

    // Only reset otp status when needed
    if (!isOtpRequestFailed) return;

    appActions.resetGetOtpRequest();
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

      logger.log('Cashback_Login_CompleteCaptchaSucceed');

      return token;
    } catch (e) {
      const { t } = this.props;

      alert(t('NetworkErrorDescription'), {
        title: t('NetworkErrorTitle'),
      });

      // We will set the attribute 'message' even if it is always empty
      logger.error('Cashback_Login_CompleteCaptchaFailed', { message: e?.message });
      throw e;
    }
  }

  async handleGetOtpCode(payload) {
    await this.props.appActions.getOtp(payload);

    const { t, isOtpRequestFailed, shouldShowErrorPopUp, errorPopUpI18nKeys } = this.props;

    if (!isOtpRequestFailed) return;

    if (shouldShowErrorPopUp) {
      const { title: titleKey, description: descriptionKey } = errorPopUpI18nKeys;

      alert(t(descriptionKey), { title: t(titleKey) });
    }

    throw new Error('Failed to get OTP code');
  }

  async handleClickContinueButton(phone, type) {
    const payload = { phone, type };
    this.setState({ sendOtp: false });
    logger.log('Cashback_Login_ClickContinueButton');

    try {
      const shouldSkipReCAPTCHACheck = !config.recaptchaEnabled;

      if (!shouldSkipReCAPTCHACheck) {
        payload.captchaToken = await this.handleCompleteReCAPTCHA();
        payload.siteKey = config.googleRecaptchaSiteKey;
      }

      // We don't need to wait this API's response, it won't block us from fetching OTP API.
      this.props.appActions.getPhoneWhatsAppSupport(phone);

      await this.handleGetOtpCode(payload);

      this.setState({ sendOtp: true, shouldShowModal: true });
    } catch (e) {
      logger.error('Cashback_Login_FetchOTPCodeFailed', { message: e?.message });
    }
  }

  async handleClickResendButton(phone, type) {
    const payload = { phone, type };
    this.setState({ sendOtp: false });
    logger.log('Cashback_Login_ClickResendButton', { type });

    try {
      const isWhatsAppType = type === OTP_REQUEST_TYPES.WHATSAPP;
      const shouldSkipReCAPTCHACheck = !config.recaptchaEnabled || isWhatsAppType;

      if (!shouldSkipReCAPTCHACheck) {
        payload.captchaToken = await this.handleCompleteReCAPTCHA();
        payload.siteKey = config.googleRecaptchaSiteKey;
      }

      await this.handleGetOtpCode(payload);

      this.setState({ sendOtp: true });
    } catch (e) {
      logger.error('Cashback_Login_RefetchOTPFailed', { type, message: e?.message });
    }
  }

  handleCaptchaLoad() {
    const { t } = this.props;

    const hasLoadSuccess = !!window.grecaptcha;
    const scriptName = 'google-recaptcha';

    window.newrelic?.addPageAction(`third-party-lib.load-script-${hasLoadSuccess ? 'succeeded' : 'failed'}`, {
      scriptName: scriptName,
    });

    if (!hasLoadSuccess) {
      alert(t('NetworkErrorDescription'), {
        title: t('NetworkErrorTitle'),
      });
    }
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

  renderOtpModal() {
    const { user, shouldShowLoader, isOtpRequestPending, isLoginRequestFailed } = this.props;
    const { sendOtp, shouldShowModal } = this.state;
    const { phone, noWhatsAppAccount, country } = user || {};

    if (!shouldShowModal) return null;

    return (
      <OtpModal
        resendOtpTime={RESEND_OTP_TIME}
        phone={phone}
        showWhatsAppResendBtn={!noWhatsAppAccount && country === 'MY'}
        onClose={this.handleCloseOtpModal.bind(this)}
        onChange={this.handleChangeOtpCode.bind(this)}
        getOtp={this.handleClickResendButton.bind(this)}
        sendOtp={this.handleWebLogin.bind(this)}
        isLoading={shouldShowLoader}
        isResending={isOtpRequestPending}
        showError={isLoginRequestFailed}
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
    const { user, title, className, t, errorTextI18nKey, isOtpRequestPending, isOtpErrorFieldVisible } = this.props;
    const { isLogin, phone, country } = user || {};
    const classList = ['login'];

    if (className) {
      classList.push(className);
    }

    if (!isLogin) {
      classList.push('active');
    }

    return (
      <section className={classList.join(' ')} data-test-id="cashback.login.container">
        <PhoneViewContainer
          className="absolute-wrapper login__container padding-left-right-normal"
          title={title}
          phone={phone}
          country={country}
          buttonText={isOtpRequestPending ? t('Processing') : t('Continue')}
          show={true}
          isProcessing={isOtpRequestPending}
          showError={isOtpErrorFieldVisible}
          errorText={t(errorTextI18nKey)}
          updatePhoneNumber={this.handleUpdateUser.bind(this)}
          updateCountry={this.handleUpdateUser.bind(this)}
          onSubmit={this.handleClickContinueButton.bind(this)}
        >
          <p className="text-center margin-top-bottom-small text-line-height-base text-opacity login__terms-privacy">
            <TermsAndPrivacy
              buttonLinkClassName="login__button-link"
              termsOfUseDataHeapName="cashback.login.term-link"
              privacyPolicyDataHeapName="cashback.login.privacy-policy-link"
            />
          </p>
        </PhoneViewContainer>
        {this.renderOtpModal()}
        {this.renderReCAPTCHA()}
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
  withTranslation(['ApiError', 'Common']),
  connect(
    state => ({
      user: getUser(state),
      shouldShowLoader: getShouldShowLoader(state),
      errorTextI18nKey: getOtpErrorTextI18nKey(state),
      errorPopUpI18nKeys: getOtpErrorPopUpI18nKeys(state),
      shouldShowErrorPopUp: getShouldShowErrorPopUp(state),
      isLoginRequestFailed: getIsLoginRequestFailed(state),
      isOtpRequestPending: getIsOtpRequestStatusPending(state),
      isOtpRequestFailed: getIsOtpRequestStatusRejected(state),
      isOtpErrorFieldVisible: getIsOtpErrorFieldVisible(state),
      isOtpInitialRequestFailed: getIsOtpInitialRequestFailed(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Login);
