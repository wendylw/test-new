/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import OtpInput from 'react-otp-input';
import Header from './Header';
import Utils from '../utils/utils';
import Constants from '../utils/constants';

// refer OTP: https://www.npmjs.com/package/react-otp-input
class OtpModal extends React.Component {
	countDownSetTimeoutObj = null;

	state = {
		otp: null,
		currentOtpTime: this.props.ResendOtpTime,
		phone: Utils.getLocalStorageVariable('user.p'),
	};

	componentWillMount() {
		const { currentOtpTime } = this.state;

		this.countDown(currentOtpTime);
	}

	countDown(currentOtpTime) {
		if (!currentOtpTime) {
			return;
		}

		this.setState({
			currentOtpTime: currentOtpTime - 1,
		});

		setTimeout(this.countDown(currentOtpTime - 1), 1000);
	}

	render() {
		const {
			show,
			phone,
			onClose,
			getOtp,
			sendOtp,
		} = this.props;
		const {
			otp,
			currentOtpTime,
		} = this.state;

		if (!show) {
			return null;
		}

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
							key="otp-input"
							onChange={otp => this.setState({ otp })}
							numInputs={Constants.OTP_CODE_SIZE}
							inputStyle={{
								width: '16vw',
								height: '16vw',
								fontSize: '8vw',
								color: '#303030',
							}}
						/>
					</div>
					<button
						className="otp-resend text-uppercase"
						disabled={!!currentOtpTime}
						onClick={getOtp}
					>
						{`Resend OTP${currentOtpTime ? `? (${currentOtpTime})` : ''}`}
					</button>
				</section>

				<footer className="footer-operation opt">
					<button
						className="button__fill button__block border-radius-base font-weight-bold text-uppercase"
						disabled={!otp || otp.length !== Constants.OTP_CODE_SIZE}
						onClick={sendOtp}
					>OK</button>
				</footer>
			</div>
		);
	}
}


OtpModal.propTypes = {
	show: PropTypes.string,
	phone: PropTypes.string,
	ResendOtpTime: PropTypes.number,
	onClose: PropTypes.func,
	getOtp: PropTypes.func,
	sendOtp: PropTypes.func,
};

OtpModal.defaultProps = {
	show: false,
	phone: '',
	ResendOtpTime: 0,
	onClose: () => { },
	sendOtp: () => { },
};

export default OtpModal;
