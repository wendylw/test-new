/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import OtpInput from 'react-otp-input';
import {
	IconSms,
	IconClose,
} from './Icons';
import Header from './Header';
import Constants from '../utils/constants';

// refer OTP: https://www.npmjs.com/package/react-otp-input
class OtpModal extends React.Component {
	render() {
		const { onClose, phone, ResendOtpTime } = this.props;

		return (
			<div className="full-aside">
				<Header navFunc={onClose} />

				<section className="full-aside__content text-center">
					<figure className="full-aside__image-container">
						<img src="/img/beep-otp.png" alt="otp" />
					</figure>
					<h2 className="full-aside__title">We’ve sent you a One Time Passcode (OTP) to {phone}. Enter it below to continue.</h2>
					<div className="otp-input">
						<OtpInput
							key={`otp-0`}
							onChange={() => { }}
							numInputs={Constants.OTP_CODE_SIZE}
							inputStyle={{
								width: '16vw',
								height: '16vw',
								fontSize: '8vw',
								color: '#303030',
							}}
						/>
					</div>
					<button className="otp-resend text-uppercase" >Resend OTP? ({ResendOtpTime})</button>
				</section>

				<footer className="footer-operation opt">
					<button className="button__fill button__block border-radius-base font-weight-bold text-uppercase">OK</button>
				</footer>
			</div>
		);
	}
}


OtpModal.propTypes = {
	phone: PropTypes.string,
	ResendOtpTime: PropTypes.number,
	onClose: PropTypes.func,
};

OtpModal.defaultProps = {
	phone: '',
	ResendOtpTime: 0,
	onClose: () => { },
};

export default OtpModal;
