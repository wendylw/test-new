/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import OtpInput from 'react-otp-input';
import Header from './Header';
import Constants from '../utils/constants';

// refer OTP: https://www.npmjs.com/package/react-otp-input
class OtpModal extends React.Component {
  countDownSetTimeoutObj = null;

  state = {
    otp: null,
    currentOtpTime: this.props.ResendOtpTime,
    isSendingOtp: this.props.isLoading,
  };

  componentDidMount() {
    const { currentOtpTime } = this.state;

    this.countDown(currentOtpTime);
  }

  componentWillReceiveProps(nextProps) {
    const { isLoading } = nextProps;

    if (isLoading !== this.props.isLoading) {
      this.setState({ isSendingOtp: isLoading });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.countDownSetTimeoutObj);
  }

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
    const { t, buttonText, onClose, getOtp, sendOtp, phone } = this.props;
    const { otp, currentOtpTime, isSendingOtp } = this.state;
    let buttonContent = buttonText;

    if (isSendingOtp) {
      buttonContent = <div className="loader"></div>;
    }

    return (
      <div className="full-aside">
        <Header navFunc={onClose} />

        <section className="full-aside__content text-center">
          <figure className="full-aside__image-container">
            <img src="/img/beep-otp.png" alt="otp" />
          </figure>
          <h2 className="full-aside__title">{t('OTPSentTitle')}</h2>
          <div className="otp-input">
            <OtpInput
              key="otp-input"
              onChange={otp => this.setState({ otp })}
              numInputs={Constants.OTP_CODE_SIZE}
              inputStyle={{
                width: '16vw',
                height: '16vw',
                fontSize: '8vw',
              }}
            />
          </div>
          <button className="otp-resend text-uppercase" disabled={!!currentOtpTime} onClick={() => getOtp(phone)}>
            {t('OTPResendTitle', { currentOtpTime: currentOtpTime ? `? (${currentOtpTime})` : '' })}
          </button>
        </section>

        <footer className="footer-operation opt">
          <button
            className="button__fill button__block border-radius-base font-weight-bold text-uppercase"
            disabled={isSendingOtp || !otp || otp.length !== Constants.OTP_CODE_SIZE}
            onClick={() => sendOtp(otp)}
          >
            {buttonContent}
          </button>
        </footer>
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
  buttonText: '',
  ResendOtpTime: 0,
  onClose: () => {},
  sendOtp: () => {},
};

export default withTranslation()(OtpModal);