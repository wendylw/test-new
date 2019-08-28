import React from 'react';
import PhoneView from '../../../components/PhoneView';
import OtpInput from 'react-otp-input';

import api from '../../../utils/api';
import Utils from '../../../utils/utils';
import config from '../../../config';


import '../../../cashback/App.scss';

const CLAIMED_ANIMATION_GIF = '/img/succeed-animation.gif';

class Test extends React.Component {
	animationSetTimeout = null;

	state = {
		phone: Utils.getPhoneNumber(),
		isSavingPhone: false,
		password: null,
		showModal: false,
		claimedAnimationGifSrc: null,
		appWebToken: null,
	}

	componentDidMount() {
		document.addEventListener('getAccessToken', (response) => {
			const { data } = response || {};

			alert(data);

			if (data) {
				this.setState({
					appWebToken: data,
					claimedAnimationGifSrc: CLAIMED_ANIMATION_GIF,
				});
			}
		}, false);

		this.requestAppToSendToken();
	}

	requestAppToSendToken() {
		if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
			window.ReactNativeWebView.postMessage('getToken');
		}
	}

	async createCustomerCashbackInfo() {
		const { phone } = this.state;
		const grant_type = 'otp';
		const response = await api({
			url: '/api/authorize',
			method: 'post',
			data: {
				grant_type,
				"username": phone,
				"client": "beep",
				"business_name": config.business
			},
		});

		let { message } = response || {};

		if (message && message === 'Verification code sent') {
			this.setState({ showModal: true });
		} else if (message && message === 'Verification code not sent') {
			alert('Server error, please try again later.');
		}
	}

	handleUpdatePhoneNumber(phone) {
		this.setState({ phone });
	}

	onCloseModal() {
		this.setState({ showModal: false });
	}

	async getToken() {
		const { password, phone } = this.state;
		const grant_type = 'otp';
		const response = await api({
			url: '/api/authorize',
			method: 'post',
			data: {
				grant_type,
				"username": phone,
				"client": "beep",
				password,
				"business_name": config.business
			},
		});

		const { access_token, refresh_token } = response;

		const tokenData = await api({
			url: '/api/login',
			method: 'post',
			data: {
				accessToken: access_token,
				refreshToken: refresh_token,
			},
		});
		const { data } = tokenData || {};
		const { webToken } = data || {};

		if (webToken) {
			this.setState({
				showModal: false,
				claimedAnimationGifSrc: CLAIMED_ANIMATION_GIF,
			});
		} else {
			alert('Server error, please try again later.');
		}
	}

	render() {
		const {
			isSavingPhone,
			phone,
			showModal,
			claimedAnimationGifSrc,
		} = this.state;

		return (
			<div>
				{
					!claimedAnimationGifSrc
						? (
							<PhoneView
								phone={phone}
								country="MY"
								setPhone={this.handleUpdatePhoneNumber.bind(this)}
								submitPhoneNumber={this.createCustomerCashbackInfo.bind(this)}
								isLoading={isSavingPhone}
								buttonText="Continue"
							/>
						)
						: null
				}
				{
					claimedAnimationGifSrc
						? (
							<div className="thanks__suceed-animation" style={{
								display: `${claimedAnimationGifSrc ? 'block' : 'none'}`
							}}>
								<img src={claimedAnimationGifSrc} alt="Beep Claimed" />

								<h2 className="text-center">LOGIN SUCCESSFUL</h2>
							</div>
						)
						: null
				}
				<div className="full-aside" style={{
					display: `${showModal ? 'block' : 'none'}`
				}}>
					<header className="header border__bottom-divider flex flex-middle flex-space-between">
						<figure
							className="header__image-container text-middle"
							onClick={this.onCloseModal.bind(this)}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
								<path d="M0 0h24v24H0z" fill="none" />
							</svg>
						</figure>
						<h2 className="header__title font-weight-bold text-middle text-center">Verification</h2>
					</header>

					<section className="full-aside__content text-center">
						<div className="otp-input">
							<OtpInput
								key="otp-1"
								onChange={otp => this.setState({ password: otp })}
								numInputs={5}
								inputStyle={{ width: '1.15em' }}
							/>
						</div>
						<button
							className="otp-resend"
							onClick={this.getToken.bind(this)}
						>
							RESEND
						</button>
					</section>

					<footer className="footer-operation opt">
						<button
							className="button__fill button__block border-radius-base font-weight-bold text-uppercase"
							disabled={!this.state.password || this.state.password.length !== 5}
							onClick={this.getToken.bind(this)}
						>Ok</button>
					</footer>
				</div>
			</div >
		);
	}
}

export default Test;