import React from 'react';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import TermsAndPrivacy from '../../../components/TermsAndPrivacy';
import Constants from '../../../utils/constants';
import HybridHeader from '../../../components/HybridHeader';
import PageLoader from '../../../components/PageLoader';
import ReCAPTCHA, { globalName as RECAPTCHA_GLOBAL_NAME } from '../../../common/components/ReCAPTCHA';
import ApiFetchError from '../../../utils/api/api-fetch-error';
import {
  actions as appActionCreators,
  getUser,
  getIsLoginRequestFailed,
  getStoreInfoForCleverTap,
} from '../../redux/modules/app';
import {
  getOtpRequestError,
  getShouldShowLoader,
  getOtpErrorTextI18nKey,
  getShouldShowErrorPopUp,
  getShouldShowGuestOption,
  getOtpErrorPopUpI18nKeys,
  getIsOtpErrorFieldVisible,
  getIsOtpInitialRequestFailed,
  getIsOtpRequestStatusPending,
  getIsOtpRequestStatusRejected,
} from './redux/selectors';
import beepLoginDisabled from '../../../images/beep-login-disabled.png';
import beepLoginActive from '../../../images/beep-login-active.svg';
import GuestModeButton from './components/GuestModeButton';
import './OrderingPageLogin.scss';
import config from '../../../config';
import prefetch from '../../../common/utils/prefetch-assets';
import logger from '../../../utils/monitoring/logger';
import Utils from '../../../utils/utils';
import { alert } from '../../../common/utils/feedback';
import { getWebQRImageHeight } from './utils';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../utils/monitoring/constants';
import CleverTap from '../../../utils/clevertap';

const { ROUTER_PATHS, OTP_REQUEST_TYPES, RESEND_OTP_TIME } = Constants;

class PageLogin extends React.Component {
  captchaRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      sendOtp: false,
      shouldShowModal: false,
      isPhoneNumberValid: false,
      imageStyle: {},
    };
  }

  componentDidMount = async () => {
    const { appActions, location } = this.props;
    const { referrerSource } = location.state || {};

    if (Utils.isTNGMiniProgram()) {
      this.loginInTngMiniProgram();
    }

    await appActions.updateLoginReferrerSource(referrerSource);

    const { shouldShowGuestOption } = this.props;

    if (shouldShowGuestOption) {
      this.setState({ imageStyle: { height: `${getWebQRImageHeight()}px` } });
    }

    prefetch(['ORD_MNU'], ['OrderingDelivery']);
  };

  componentDidUpdate(prevProps, prevState) {
    const { imageStyle: prevImageStyle } = prevState;
    const { imageStyle: currImageStyle } = this.state;
    const { user: prevUser } = prevProps;
    const { user: currUser, shouldShowGuestOption } = this.props;
    const { sendOtp } = this.state;
    const imageHeight = getWebQRImageHeight();

    if (sendOtp && currUser.isLogin && prevUser.isLogin !== currUser.isLogin) {
      this.visitNextPage();
    }

    if (shouldShowGuestOption && currImageStyle?.height && prevImageStyle?.height !== `${imageHeight}px`) {
      this.updateImageHeight(imageHeight);
    }
  }

  handleCloseOtpModal = () => {
    const { appActions } = this.props;

    this.setState({ shouldShowModal: false }, () => appActions.resetSendOtpRequest());
  };

  handleChangeOtpCode = () => {
    const { isLoginRequestFailed, appActions } = this.props;

    if (!isLoginRequestFailed) return;

    // Only update create otp status when needed
    appActions.resetSendOtpRequest();
  };

  handleUpdateUser = user => {
    const { appActions, isOtpRequestFailed } = this.props;

    appActions.updateUser(user);

    // Only reset otp status when needed
    if (!isOtpRequestFailed) return;

    appActions.resetGetOtpRequest();
  };

  handleUpdatePhoneNumberValidation = isValid => {
    this.setState({ isPhoneNumberValid: isValid });
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
    const { appActions } = this.props;

    await appActions.getOtp(payload);

    const { t, isOtpRequestFailed, otpError, shouldShowErrorPopUp, errorPopUpI18nKeys } = this.props;

    if (!isOtpRequestFailed) return;

    if (shouldShowErrorPopUp) {
      const { title: titleKey, description: descriptionKey } = errorPopUpI18nKeys;

      alert(t(descriptionKey), { title: t(titleKey), closeButtonClassName: 'button__block text-uppercase' });
    }

    throw new ApiFetchError('Failed to get OTP code', { ...otpError });
  }

  handleClickContinueButton = async (phone, type) => {
    const { storeInfoForCleverTap, appActions } = this.props;
    const payload = { phone, type };

    this.setState({ sendOtp: false });
    logger.log('Ordering_PageLogin_ClickContinueButton');
    CleverTap.pushEvent('Login - Continue', storeInfoForCleverTap);

    try {
      const shouldSkipReCAPTCHACheck = !config.recaptchaEnabled;

      if (!shouldSkipReCAPTCHACheck) {
        payload.captchaToken = await this.handleCompleteReCAPTCHA();
        payload.siteKey = config.googleRecaptchaSiteKey;
      }

      // We don't need to wait this API's response, it won't block us from fetching OTP API.
      appActions.getPhoneWhatsAppSupport(phone);

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
          errorCategory: e?.name,
        }
      );
    }
  };

  handleClickResendButton = async (phone, type) => {
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
          errorCategory: e?.name,
        }
      );
    }
  };

  handleCaptchaLoad = () => {
    const { t } = this.props;

    const hasLoadSuccess = !!window.grecaptcha;
    const scriptName = 'google-recaptcha';

    window.newrelic?.addPageAction(`third-party-lib.load-script-${hasLoadSuccess ? 'succeeded' : 'failed'}`, {
      scriptName,
    });

    if (!hasLoadSuccess) {
      alert(t('NetworkErrorDescription'), {
        title: t('NetworkErrorTitle'),
      });
    }
  };

  handleWebLogin = async otp => {
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

        const { user: newUser } = this.props;
        const hasLoggedIn = _get(newUser, 'isLogin', false);

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
  };

  handleClickContinueAsGuestButton = async () => {
    const { appActions, storeInfoForCleverTap } = this.props;

    CleverTap.pushEvent('Login - Continue as Guest', storeInfoForCleverTap);

    try {
      await appActions.setConsumerAsGuest();

      this.visitNextPage();
    } catch (error) {
      // NOTE: No need to throw an error, the error is used to log an event only.
      logger.error('Ordering_PageLogin_LoginAsGuestFailed', {
        message: error?.message,
      });
    }
  };

  updateImageHeight = height => {
    this.setState({
      imageStyle: { height: `${height}px` },
    });
  };

  visitNextPage = async () => {
    const { history, location } = this.props;
    const { redirectLocation, isRedirect } = location.state || {};

    if (redirectLocation && !isRedirect) {
      history.replace(redirectLocation);

      return;
    }

    if (redirectLocation && isRedirect) {
      window.location.replace(redirectLocation);

      return;
    }

    this.goBack();
  };

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
        data-test-id="ordering.page-login.otp-modal"
        onClose={this.handleCloseOtpModal}
        onChange={this.handleChangeOtpCode}
        getOtp={this.handleClickResendButton}
        sendOtp={this.handleWebLogin}
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
        asyncScriptOnLoad={this.handleCaptchaLoad}
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
      shouldShowGuestOption,
    } = this.props;
    const { isPhoneNumberValid, imageStyle } = this.state;
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

    if (shouldShowGuestOption) {
      classList.push('qr-ordering');
    }

    return (
      <>
        <section className={classList.join(' ')} data-test-id="ordering.login.container">
          <HybridHeader
            className="flex-middle"
            contentClassName="flex-middle"
            data-test-id="ordering.login.header"
            title="Login or Create Account"
            isPage
            navFunc={this.goBack}
          />
          <div className="page-login__container">
            <figure
              className="page-login__image-container padding-top-bottom-normal margin-top-bottom-small"
              style={imageStyle}
            >
              <img
                src={beepLoginActive}
                alt="otp active"
                className={`${isPhoneNumberValid ? '' : 'page-login__icon--hide'}`}
              />
              <img
                src={beepLoginDisabled}
                alt="otp disabled"
                className={`${isPhoneNumberValid ? 'page-login__icon--hide' : 'page-login__disabled'}`}
              />
            </figure>
            <PhoneViewContainer
              className="padding-normal margin-normal"
              phone={phone}
              content={t('LoginTip')}
              country={country}
              buttonText={isOtpRequestPending ? t('Processing') : t('Continue')}
              show
              isProcessing={isOtpRequestPending}
              showError={isOtpErrorFieldVisible}
              errorText={t(errorTextI18nKey)}
              updatePhoneNumber={this.handleUpdateUser}
              updateCountry={this.handleUpdateUser}
              onValidate={this.handleUpdatePhoneNumberValidation}
              onSubmit={this.handleClickContinueButton}
            >
              <p className="page-login__terms-privacy text-center margin-top-bottom-small text-line-height-base">
                <TermsAndPrivacy buttonLinkClassName="page-login__button-link" />
              </p>

              {shouldShowGuestOption && <GuestModeButton onContinueAsGuest={this.handleClickContinueAsGuestButton} />}
            </PhoneViewContainer>
          </div>
        </section>
        {this.renderOtpModal()}
        {this.renderReCAPTCHA()}
      </>
    );
  }
}
PageLogin.displayName = 'PageLogin';

PageLogin.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  errorTextI18nKey: PropTypes.string,
  isRequestSucceed: PropTypes.bool,
  shouldShowLoader: PropTypes.bool,
  isOtpRequestFailed: PropTypes.bool,
  isOtpRequestPending: PropTypes.bool,
  isLoginRequestFailed: PropTypes.bool,
  shouldShowErrorPopUp: PropTypes.bool,
  shouldShowGuestOption: PropTypes.bool,
  isOtpErrorFieldVisible: PropTypes.bool,
  /* eslint-disable react/forbid-prop-types */
  user: PropTypes.object,
  otpError: PropTypes.object,
  location: PropTypes.object,
  storeInfoForCleverTap: PropTypes.object,
  /* eslint-enable */
  errorPopUpI18nKeys: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
  }),
  appActions: PropTypes.shape({
    getOtp: PropTypes.func,
    sendOtp: PropTypes.func,
    loginApp: PropTypes.func,
    updateUser: PropTypes.func,
    updateLoginReferrerSource: PropTypes.func,
    setConsumerAsGuest: PropTypes.func,
    resetGetOtpRequest: PropTypes.func,
    resetSendOtpRequest: PropTypes.func,
    loginByTngMiniProgram: PropTypes.func,
    getPhoneWhatsAppSupport: PropTypes.func,
  }),
};

PageLogin.defaultProps = {
  user: {},
  title: '',
  className: '',
  location: null,
  otpError: null,
  errorTextI18nKey: '',
  isRequestSucceed: false,
  shouldShowLoader: false,
  isOtpRequestFailed: false,
  isOtpRequestPending: false,
  isLoginRequestFailed: false,
  shouldShowErrorPopUp: false,
  shouldShowGuestOption: false,
  isOtpErrorFieldVisible: false,
  storeInfoForCleverTap: null,
  errorPopUpI18nKeys: {
    title: '',
    description: '',
  },
  appActions: {
    getOtp: () => {},
    sendOtp: () => {},
    loginApp: () => {},
    updateUser: () => {},
    updateLoginReferrerSource: () => {},
    setConsumerAsGuest: () => {},
    resetGetOtpRequest: () => {},
    resetSendOtpRequest: () => {},
    loginByTngMiniProgram: () => {},
    getPhoneWhatsAppSupport: () => {},
  },
};

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      otpError: getOtpRequestError(state),
      shouldShowLoader: getShouldShowLoader(state),
      errorTextI18nKey: getOtpErrorTextI18nKey(state),
      errorPopUpI18nKeys: getOtpErrorPopUpI18nKeys(state),
      shouldShowErrorPopUp: getShouldShowErrorPopUp(state),
      isLoginRequestFailed: getIsLoginRequestFailed(state),
      isOtpRequestPending: getIsOtpRequestStatusPending(state),
      isOtpRequestFailed: getIsOtpRequestStatusRejected(state),
      isOtpErrorFieldVisible: getIsOtpErrorFieldVisible(state),
      isOtpInitialRequestFailed: getIsOtpInitialRequestFailed(state),
      shouldShowGuestOption: getShouldShowGuestOption(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(PageLogin);
