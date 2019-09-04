/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import OtpInput from 'react-otp-input';
import {
	IconSms,
	IconClose,
} from './Icons';
import Constants from '../utils/constants';

// refer OTP: https://www.npmjs.com/package/react-otp-input
class OtpModal extends React.Component {
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
						<IconClose />
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
					<button className="button__fill button__block border-radius-base font-weight-bold text-uppercase">OK</button>
				</footer>
			</div>
		);
	}
}

export default OtpModal;
