/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import { Trans, withTranslation } from 'react-i18next';
import { captureException } from '@sentry/react';
import Header from './Header';
import Constants from '../utils/constants';
import beepOtpLock from '../images/beep-otp-lock.svg';
import beepOtpError from '../images/beep-otp-error.svg';
import Utils from '../utils/utils';
import './OtpModal.scss';
import TermsAndPrivacy from './TermsAndPrivacy';
import CleverTap from '../utils/clevertap';

const elementPartialOffsetTop = (el, topAdjustment = 0, windowScrolledTop = 0) => {
  const isSafari = Utils.getUserAgentInfo().browser.includes('Safari');
  const height = isSafari ? el.getBoundingClientRect().height : el.offsetHeight;
  let top = windowScrolledTop + el.getBoundingClientRect().top;

  if (!isSafari) {
    let currentParent = el.offsetParent;

    top = el.offsetTop;

    while (currentParent !== null) {
      top += currentParent.offsetTop;
      currentParent = currentParent.offsetParent;
    }
  }

  return top + height - windowScrolledTop - topAdjustment;
};

// refer OTP: https://www.npmjs.com/package/react-otp-input
class OtpModal extends React.Component {
  countDownSetTimeoutObj = null;

  inputRef = React.createRef();

  addressAsideInnerRef = React.createRef();

  constructor(props) {
    super(props);
    const { resendOtpTime } = props;
    this.state = {
      otp: '',
      currentOtpTime: resendOtpTime,
    };
  }

  componentDidMount() {
    const { currentOtpTime } = this.state;
    this.countDown(currentOtpTime);

    const windowWidth = document.body.clientWidth || window.innerWidth;

    if (windowWidth < 770) {
      this.inputRef.current.addEventListener(
        'focus',
        () => {
          try {
            const bottomValue = this.getScrollBottom();

            if (!this.addressAsideInnerRef || !this.addressAsideInnerRef.current) return;
            this.addressAsideInnerRef.current.style.transform = `translateY(-${bottomValue}px)`;
          } catch (e) {
            captureException(e);
          }
        },
        false
      );
      this.inputRef.current.addEventListener(
        'blur',
        () => {
          setTimeout(() => {
            try {
              if (!this.addressAsideInnerRef || !this.addressAsideInnerRef.current) return;
              this.addressAsideInnerRef.current.style.transform = 'none';
            } catch (e) {
              captureException(e);
            }
          }, 100);
        },
        false
      );
    }
  }

  componentDidUpdate(prevProps) {
    const { shouldCountdown: currShouldCountdown, resendOtpTime } = this.props;
    const { shouldCountdown: prevShouldCountdown } = prevProps;

    if (!prevShouldCountdown && currShouldCountdown) {
      this.countDown(resendOtpTime);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.countDownSetTimeoutObj);
  }

  getScrollBottom() {
    const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
    const otpInput = document.getElementById('newOtpInput');
    const top = elementPartialOffsetTop(otpInput);
    const inputBottom = windowHeight - top;
    const scrollHeight = windowHeight / 2 - inputBottom;
    return scrollHeight;
  }

  updateAndValidateOtp = otp => {
    const { sendOtp, onChange } = this.props;
    this.setState(
      {
        otp,
      },
      () => {
        const { otp: newOtp } = this.state;
        if (newOtp.length !== Constants.OTP_CODE_SIZE) {
          onChange();
        }

        if (newOtp.length === Constants.OTP_CODE_SIZE) {
          // Unfocus the OTP input to prevent users from changing OTP
          // And at the same time do auto validation
          document.getElementById('newOtpInput').blur();
          sendOtp(newOtp);
        }
      }
    );
  };

  countDown(currentOtpTime) {
    clearTimeout(this.countDownSetTimeoutObj);

    if (!currentOtpTime) {
      return;
    }

    this.setState({
      currentOtpTime: currentOtpTime - 1,
    });

    this.countDownSetTimeoutObj = setTimeout(() => this.countDown(currentOtpTime - 1), 1000);
  }

  render() {
    const { t, onClose, getOtp, isLoading, isResending, phone, showWhatsAppResendBtn, showError } = this.props;
    const { currentOtpTime, otp } = this.state;

    return (
      <div className="otp-modal absolute-wrapper flex flex-column" data-test-id="common.otp-modal.container">
        <Header
          className="otp-modal__header border__bottom-divider"
          navFunc={onClose}
          data-test-id="common.otp-modal.header"
        />

        <section ref={this.addressAsideInnerRef} className="text-center">
          <figure className="otp-modal__image-container padding-top-bottom-normal margin-top-bottom-small">
            {showError ? <img src={beepOtpError} alt="otp" /> : <img src={beepOtpLock} alt="otp" />}
          </figure>
          <div className="otp-modal__content text-left">
            <h2 className="text-size-biggest text-line-height-base">{t('EnterOTP')}</h2>
            <p className="margin-top-bottom-normal">
              <Trans i18nKey="OTPSentTip">
                A code is sent to <span className="text-weight-bolder">{{ phone }}</span>
              </Trans>
            </p>
            <div className="otp-modal__input-group">
              <div
                className={`otp-modal__form-group form__group flex flex-middle flex-space-between text-size-larger ${
                  showError ? 'otp-modal__form-group--error' : ''
                }`}
              >
                <input
                  id="newOtpInput"
                  ref={this.inputRef}
                  value={showError ? '' : otp}
                  className="otp-modal__input form__input text-size-larger"
                  data-test-id="common.otp-modal.new-otp-input"
                  onChange={e => this.updateAndValidateOtp(e.target.value)}
                  maxLength={Constants.OTP_CODE_SIZE}
                  type="tel"
                  placeholder="00000"
                  autoComplete="off"
                />
              </div>
              {showError && (
                <p className="otp-modal__failed-otp padding-top-bottom-small">{t('CodeVerificationFailed')}</p>
              )}
            </div>
          </div>
          <div className="flex flex-center flex-middle">
            {!currentOtpTime ? (
              <div className="flex flex-column">
                <button
                  className="otp-modal__button-resend-sms button button__link padding-normal text-weight-bolder text-uppercase"
                  data-test-id="common.otp-modal.resend-btn"
                  onClick={() => {
                    CleverTap.pushEvent('Login - Resend OTP');
                    getOtp(phone, Constants.OTP_REQUEST_TYPES.RE_SEND_OTP);
                  }}
                >
                  {t('ResendViaSMS')}
                </button>
                {showWhatsAppResendBtn && (
                  <button
                    className="otp-modal__button-resend-whats button button__link padding-small margin-top-bottom-normal text-size-small text-weight-bolder text-uppercase"
                    data-test-id="common.otp-modal.resend-whats-btn"
                    onClick={() => {
                      CleverTap.pushEvent('Login - Resend Whatsapp OTP');
                      getOtp(phone, Constants.OTP_REQUEST_TYPES.WHATSAPP);
                    }}
                  >
                    {t('ResendViaWhatsAPP')}
                  </button>
                )}
              </div>
            ) : (
              <button className="otp-modal__resend-tip button button__link margin-top-bottom-normal">
                {t('OTPResendTitle', { currentOtpTime: currentOtpTime ? ` ${currentOtpTime}` : '' })}
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="page-loader flex flex-middle flex-center">
              <div className="prompt-loader padding-small border-radius-large text-center flex flex-middle flex-center">
                <div className="prompt-loader__content">
                  <i className="circle-loader margin-smaller" />
                  <span className="prompt-loader__text margin-top-bottom-smaller text-size-smaller">
                    {isResending ? t('ResendingCode') : t('VerifyingCode')}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <p className="text-center margin-top-bottom-small text-line-height-base text-opacity">
          <TermsAndPrivacy
            buttonLinkClassName="page-login__button-link"
            termsOfUseDataHeapName="ordering.common.login.term-link"
            privacyPolicyDataHeapName="ordering.common.login.privacy-policy-link"
          />
        </p>
      </div>
    );
  }
}

OtpModal.propTypes = {
  phone: PropTypes.string,
  resendOtpTime: PropTypes.number,
  isLoading: PropTypes.bool,
  isResending: PropTypes.bool,
  showError: PropTypes.bool,
  showWhatsAppResendBtn: PropTypes.bool,
  shouldCountdown: PropTypes.bool,
  onClose: PropTypes.func,
  onChange: PropTypes.func,
  getOtp: PropTypes.func,
  sendOtp: PropTypes.func,
};

OtpModal.defaultProps = {
  phone: '',
  resendOtpTime: 0,
  showError: false,
  isLoading: false,
  isResending: false,
  shouldCountdown: false,
  showWhatsAppResendBtn: false,
  onClose: () => {},
  onChange: () => {},
  sendOtp: () => {},
  getOtp: () => {},
};
OtpModal.displayName = 'OtpModal';

export default withTranslation()(OtpModal);
