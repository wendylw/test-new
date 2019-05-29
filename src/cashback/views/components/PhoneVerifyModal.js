/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import OtpInput from 'react-otp-input';
import Constants from '../../utils/Constants';
import api from '../../utils/api';
import iconSms from '../../images/icon-sms.svg';

// refer OTP: https://www.npmjs.com/package/react-otp-input
class PhoneVerifyModal extends React.Component {
  hide() {
    this.setState({ show: false, otp: '' });
  }

  async submitOtp() {
    const { otp } = this.state;
    const { phone, onSuccess } = this.props;

    console.log('otp => %o, phone => %o', otp, phone);

    const { ok, data } = await api({
      url: Constants.api.CODE_VERIFY(otp),
      method: 'get',
      params: {
        phone,
      },
    });

    console.log(ok, data);

    if (ok && data.verify && onSuccess) {
      onSuccess();
    }
  }

  render() {
    const { show, onClose, phone } = this.props;

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
              <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle text-center">OTP Verification</h2>
        </header>

        <section className="full-aside__content text-center">
          <figure>
            <img src={iconSms} />
          </figure>
          <h2 className="full-aside__title">To protect your account, we've sent you a One Time Passcode (OTP) to {phone}. Enter it below.</h2>
          <div className="otp-input">
            <OtpInput
              onChange={otp => this.setState({ otp })}
              numInputs={5}
              inputStyle={{ width: '1.15em' }}
            />
          </div>
        </section>

        <footer className="footer-operation">
          <button className="button__fill button__block border-radius-base font-weight-bold text-uppercase" onClick={this.submitOtp.bind(this)}>Ok</button>
        </footer>
      </div>
    );
  }
}

export default PhoneVerifyModal;
