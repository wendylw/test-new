/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import { Trans, withTranslation } from 'react-i18next';
import OtpInput from 'react-otp-input';
import Header from './Header';
import Constants from '../utils/constants';
import beepOtpLock from '../images/beep-otp-lock.svg';
import Utils from '../utils/utils';
import { captureException } from '@sentry/react';
import './OtpModal.scss';
import TermsAndPrivacy from './TermsAndPrivacy';

// refer OTP: https://www.npmjs.com/package/react-otp-input
class OtpModal extends React.Component {
  countDownSetTimeoutObj = null;

  state = {
    otp: null,
    currentOtpTime: this.props.ResendOtpTime,
    isNewInput: true,
  };

  inputRef = React.createRef();
  addressAsideInnerRef = React.createRef();

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

  getScrollBottom() {
    const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
    const otpInput = document.getElementById('newOtpInput');
    const top = Utils.elementPartialOffsetTop(otpInput);
    const inputBottom = windowHeight - top;
    const scrollHeight = windowHeight / 2 - inputBottom;
    return scrollHeight;
  }

  componentWillUnmount() {
    clearTimeout(this.countDownSetTimeoutObj);
  }

  updateAndValidateOtp = otp => {
    const { sendOtp } = this.props;
    this.setState(
      {
        otp,
      },
      () => {
        const { otp: newOtp } = this.state;
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
    const { t, onClose, getOtp, isLoading, phone, ResendOtpTime } = this.props;
    const { currentOtpTime, isNewInput } = this.state;

    return (
      <div className="otp-modal absolute-wrapper flex flex-column" data-heap-name="common.otp-modal.container">
        <Header
          className="otp-modal__header border__bottom-divider"
          navFunc={onClose}
          data-heap-name="common.otp-modal.header"
        />

        <section ref={this.addressAsideInnerRef} className="otp-modal__container text-center">
          <figure className="otp-modal__image-container padding-top-bottom-normal margin-top-bottom-small">
            <img src={beepOtpLock} alt="otp" />
          </figure>
          <h2 className="padding-normal text-size-big text-line-height-base">
            <Trans i18nKey="OTPSentTitle">
              We’ve sent you a One Time Passcode (OTP) to
              <span className="text-size-big text-weight-bolder">{{ phone }}</span>. Enter it below to continue.
            </Trans>
          </h2>
          <div className="margin-small">
            {isNewInput ? (
              <div className="otp-modal__group form__group flex flex-middle flex-space-between text-size-larger">
                <input
                  id="newOtpInput"
                  ref={this.inputRef}
                  className="otp-modal__input form__input text-size-larger"
                  data-heap-name="common.otp-modal.new-otp-input"
                  onChange={e => this.updateAndValidateOtp(e.target.value)}
                  maxLength={Constants.OTP_CODE_SIZE}
                  type="tel"
                  placeholder="00000"
                  autoComplete="off"
                />
              </div>
            ) : (
              <OtpInput
                key="otp-input"
                // NOTE: OtpInput seems not support data attr, but we are not using old OtpInput anyway. This is just a placeholder.
                data-heap-name="common.otp-modal.old-otp-input"
                onChange={otp => this.updateAndValidateOtp(otp)}
                numInputs={Constants.OTP_CODE_SIZE}
                inputStyle={{
                  width: '16vw',
                  height: '16vw',
                  fontSize: '8vw',
                }}
              />
            )}
          </div>
          <div className="margin-top-bottom-normal">
            <p className="otp-modal__resend-tip text-size-big">{t('ResendOTPTip')}</p>
            <button
              className="otp-modal__button-resend button button__link padding-small text-size-big text-weight-bolder"
              data-heap-name="common.otp-modal.resend-btn"
              disabled={!!currentOtpTime}
              onClick={() => {
                this.setState({ currentOtpTime: ResendOtpTime });
                this.countDown(ResendOtpTime);
                getOtp(phone);
              }}
            >
              {t('OTPResendTitle', { currentOtpTime: currentOtpTime ? `? (${currentOtpTime})` : '' })}
            </button>
          </div>
          {isLoading && <div className="loader theme full-page"></div>}
        </section>

        <p className="text-center margin-top-bottom-small text-line-height-base text-opacity">
          <TermsAndPrivacy buttonLinkClassName="page-login__button-link" />
        </p>
      </div>
    );
  }
}

OtpModal.propTypes = {
  phone: PropTypes.string,
  buttonText: PropTypes.string,
  ResendOtpTime: PropTypes.number,
  isLoading: PropTypes.bool,
  onClose: PropTypes.func,
  getOtp: PropTypes.func,
  sendOtp: PropTypes.func,
};

OtpModal.defaultProps = {
  phone: '',
  buttonText: '',
  ResendOtpTime: 0,
  isLoading: false,
  onClose: () => {},
  sendOtp: () => {},
};

export default withTranslation()(OtpModal);
