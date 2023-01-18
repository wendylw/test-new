import React from 'react';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import TermsAndPrivacy from '../../../components/TermsAndPrivacy';
import Constants from '../../../utils/constants';
import HybridHeader from '../../../components/HybridHeader';
import PageLoader from '../../../components/PageLoader';
import ReCAPTCHA, { globalName as RECAPTCHA_GLOBAL_NAME } from '../../../common/components/ReCAPTCHA';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getUser, getIsLoginRequestFailed } from '../../redux/modules/app';
import {
  getShouldShowLoader,
  getOtpErrorTextI18nKey,
  getShouldShowErrorPopUp,
  getOtpErrorPopUpI18nKeys,
  getIsOtpErrorFieldVisible,
  getIsOtpInitialRequestFailed,
  getIsOtpRequestStatusPending,
  getIsOtpRequestStatusRejected,
} from './redux/selectors';
import beepLoginDisabled from '../../../images/beep-login-disabled.png';
import beepLoginActive from '../../../images/beep-login-active.svg';
import './OrderingPageLogin.scss';
import config from '../../../config';
import prefetch from '../../../common/utils/prefetch-assets';
import logger from '../../../utils/monitoring/logger';
import Utils from '../../../utils/utils';
import { alert } from '../../../common/utils/feedback';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../utils/monitoring/constants';

const { ROUTER_PATHS, OTP_REQUEST_TYPES, RESEND_OTP_TIME } = Constants;

class PageLogin extends React.Component {
  state = {
    sendOtp: false,
    shouldShowModal: false,
    isValidPhoneNumberImage: false,
  };

  captchaRef = React.createRef();

  componentDidMount() {
    if (Utils.isTNGMiniProgram()) {
      this.loginInTngMiniProgram();
    }

    prefetch(['ORD_MNU'], ['OrderingDelivery']);
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
    const { redirectLocation, isRedirect } = location.state || {};

    if (redirectLocation && !isRedirect) {
      history.replace(redirectLocation);

      return;
    } else if (redirectLocation && isRedirect) {
      window.location.replace(redirectLocation);

      return;
    }
    this.goBack();
  };

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

  handleUpdateIsValidPhoneNumber = isValid => {
    this.setState({ isValidPhoneNumberImage: isValid });
  };

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

      logger.log('Ordering_PageLogin_CompleteCaptchaSucceed');

      return token;
    } catch (e) {
      const { t } = this.props;

      alert(t('NetworkErrorDescription'), {
        title: t('NetworkErrorTitle'),
      });

      // We will set the attribute 'message' even if it is always empty
      logger.error(
        'Ordering_PageLogin_CompleteCaptchaFailed',
        { message: e?.message },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.LOGIN,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.LOGIN].RECEIVE_OTP,
          },
        }
      );
      throw e;
    }
  }

  async handleGetOtpCode(payload) {
    await this.props.appActions.getOtp(payload);

    const { t, isOtpRequestFailed, shouldShowErrorPopUp, errorPopUpI18nKeys } = this.props;

    if (!isOtpRequestFailed) return;

    if (shouldShowErrorPopUp) {
      const { title: titleKey, description: descriptionKey } = errorPopUpI18nKeys;

      alert(t(descriptionKey), { title: t(titleKey), closeButtonClassName: 'button__block text-uppercase' });
    }

    throw new Error('Failed to get OTP code');
  }

  async handleClickContinueButton(phone, type) {
    const payload = { phone, type };
    this.setState({ sendOtp: false });
    logger.log('Ordering_PageLogin_ClickContinueButton');

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
      logger.error(
        'Ordering_PageLogin_SubmitPhoneNumberFailed',
        { message: e?.message },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.LOGIN,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.LOGIN].RECEIVE_OTP,
          },
        }
      );
    }
  }

  async handleClickResendButton(phone, type) {
    const payload = { phone, type };
    this.setState({ sendOtp: false });
    logger.log('Ordering_PageLogin_ClickResendButton', { type });

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
      logger.error(
        'Ordering_PageLogin_RefetchOTPFailed',
        {
          type,
          message: e?.message,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.LOGIN,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.LOGIN].RECEIVE_OTP,
          },
        }
      );
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
    const { appActions, location } = this.props;
    const loginOptions = location.state?.loginOptions || {};
    const { shippingType } = loginOptions;

    try {
      await appActions.sendOtp({ otp });

      const { isLoginRequestFailed } = this.props;

      if (isLoginRequestFailed) {
        throw new Error('Failed to verify OTP');
      }

      const { user } = this.props;
      const { accessToken, refreshToken } = user;

      if (accessToken && refreshToken) {
        await appActions.loginApp({
          accessToken,
          refreshToken,
          shippingType,
        });

        const hasLoggedIn = _get(this.props.user, 'isLogin', false);

        if (!hasLoggedIn) {
          throw new Error('Failed to login');
        }
      } else {
        throw new Error(`Missing ${!accessToken ? 'accessToken' : 'refreshToken'}`);
      }
    } catch (error) {
      // NOTE: No need to throw an error, the error is used to log an event only.
      logger.error(
        'Ordering_PageLogin_LoginFailed',
        {
          message: error?.message,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.LOGIN,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.LOGIN].SUBMIT_OTP,
          },
        }
      );
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
      pathname: ROUTER_PATHS.ORDERING_HOME,
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
    const { user, shouldShowLoader, isOtpRequestPending, isLoginRequestFailed } = this.props;
    const { sendOtp, shouldShowModal } = this.state;
    const { phone, noWhatsAppAccount, country } = user || {};

    if (!shouldShowModal) return null;

    return (
      <OtpModal
        resendOtpTime={RESEND_OTP_TIME}
        phone={phone}
        country={country}
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
    const {
      t,
      user,
      className,
      errorTextI18nKey,
      isRequestSucceed,
      isOtpRequestPending,
      isOtpErrorFieldVisible,
    } = this.props;
    const { isValidPhoneNumberImage } = this.state;
    const { isLogin, phone, country } = user || {};
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

    if (isRequestSucceed) {
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
                className={`${isValidPhoneNumberImage ? '' : 'page-login__icon--hide'}`}
              />
              <img
                src={beepLoginDisabled}
                alt="otp disabled"
                className={`${isValidPhoneNumberImage ? 'page-login__icon--hide' : 'page-login__disabled'}`}
              />
            </figure>
            <PhoneViewContainer
              className="padding-normal margin-normal"
              phone={phone}
              content={t('LoginTip')}
              country={country}
              buttonText={isOtpRequestPending ? t('Processing') : t('Continue')}
              show={true}
              isProcessing={isOtpRequestPending}
              showError={isOtpErrorFieldVisible}
              errorText={t(errorTextI18nKey)}
              updatePhoneNumber={this.handleUpdateUser.bind(this)}
              updateCountry={this.handleUpdateUser.bind(this)}
              onValidation={this.handleUpdateIsValidPhoneNumber}
              onSubmit={this.handleClickContinueButton.bind(this)}
            >
              <p className="text-center margin-top-bottom-small text-line-height-base text-opacity">
                <TermsAndPrivacy buttonLinkClassName="page-login__button-link" />
              </p>
            </PhoneViewContainer>
          </div>
        </section>
        {this.renderOtpModal()}
        {this.renderReCAPTCHA()}
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
)(PageLogin);
