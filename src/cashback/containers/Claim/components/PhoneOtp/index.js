/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import OtpInput from 'react-otp-input';
import { IconSms } from './Icons';
import Constants from '../../../../../utils/constants';

const OTP_COUNT_DOWN_MAX = 20; // seconds

// refer OTP: https://www.npmjs.com/package/react-otp-input
class PhoneVerifyModal extends React.Component {
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
							key={`otp-0`}
							onChange={() => { }}
							numInputs={Constants.OTP_CODE_SIZE}
							inputStyle={{ width: '1.15em' }}
						/>
					</div>
					<button className="otp-resend" >RESEND OTP?</button>
				</section>

				<footer className="footer-operation opt">
					<button className="button__fill button__block border-radius-base font-weight-bold text-uppercase">Ok</button>
				</footer>
			</div>
		);
	}
}

export default PhoneVerifyModal;
