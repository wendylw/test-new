/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router";
import OtpInput from 'react-otp-input';
import { tryOtpAndSaveCashback, sendMessage, sendOtp } from '../../actions';
import Constants from '../../../Constants';
import { IconSms } from './Icons';

const OTP_COUNT_DOWN_MAX = 20; // seconds

// refer OTP: https://www.npmjs.com/package/react-otp-input
class PhoneVerifyModal extends React.Component {
  state = {
    resendCountDown: OTP_COUNT_DOWN_MAX,
    otp: '',
  };

  hide() {
    this.setState({ otp: '' });
  }

  async submitOtp() {
    const { otp } = this.state;
    const { phone, tryOtpAndSaveCashback, sendMessage, country, history } = this.props;

    try {
      // Notice: this api has been updated, that: otp (removed), country (removed)
      await tryOtpAndSaveCashback(phone, otp, country, history);
    } catch (e) {
      console.error(e);
      await sendMessage({
        errorStatus: 'Save_Cashback_Failed',
      });
    }
  }

  renderResendButton() {
    const { otpCountDown, sendOtp, phone } = this.props;
    const countLabel = otpCountDown > 0 ? `(${otpCountDown})` : '';

    return (
      <button
        className="otp-resend" disabled={otpCountDown > 0}
        onClick={() => sendOtp(phone)}
      >
        {`RESEND OTP? ${countLabel}`}
      </button>
    );
  }

  render() {
    const { onClose, phone, otpRenderTime } = this.props;

    if (typeof onClose !== 'function') {
      console.error('onClose is required');
      return null;
    }

    return (
      <div className="full-aside">
        <header className="header border__bottom-divider flex flex-middle flex-space-between">
          <figure
            className="header__image-container text-middle"
            ref={this.headerRef}
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle text-center">OTP Verification</h2>
        </header>

        <section className="full-aside__content text-center">
          <figure className="full-aside__image-container">
            <IconSms />
          </figure>
          <h2 className="full-aside__title">To protect your account, we've sent you a One Time Passcode (OTP) to {phone}. Enter it below.</h2>
          <div className="otp-input">
            <OtpInput
              key={`otp-${otpRenderTime}`}
              onChange={otp => this.setState({ otp }, () => {
                // auto submit OTP logic
                if (otp.length === Constants.OTP_CODE_SIZE) {
                  this.submitOtp();
                }
              })}
              numInputs={Constants.OTP_CODE_SIZE}
              inputStyle={{ width: '1.15em' }}
            />
          </div>
          {this.renderResendButton()}
        </section>

        <footer className="footer-operation">
          <button
            className="button__fill button__block border-radius-base font-weight-bold text-uppercase"
            disabled={!this.state.otp || this.state.otp.length !== Constants.OTP_CODE_SIZE}
            onClick={this.submitOtp.bind(this)}
          >Ok</button>
        </footer>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  country: (state.common.onlineStoreInfo || {}).country,
  otpCountDown: state.user.otpCountDown,
  otpRenderTime: state.user.otpRenderTime,
});

const mapDispathToProps = dispatch => bindActionCreators({
  tryOtpAndSaveCashback,
  sendMessage,
  sendOtp,
}, dispatch);

export default connect(mapStateToProps, mapDispathToProps)(
  withRouter(PhoneVerifyModal),
);
