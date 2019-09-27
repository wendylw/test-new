import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Link } from 'react-router-dom';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getUser, getOnlineStoreInfo } from '../../redux/modules/app';
import Utils from '../../../utils/utils';

class Login extends React.Component {
	state = {
		phone: Utils.getLocalStorageVariable('user.p'),
	};

	handleCloseOtpModal() {
		const { appActions } = this.props;

		appActions.resetOtpStatus();
	}

	handleUpdatePhoneNumber(phone) {
		this.setState({ phone });
	}

	async handleSubmitPhoneNumber() {
		const { appActions } = this.props;
		const { phone } = this.state;

		appActions.getOtp({ phone });
	}

	async handleWebLogin(otp) {
		const { appActions } = this.props;
		const { phone } = this.state;

		await appActions.sendOtp({
			phone,
			otp,
		});
	}

	renderOtpModal() {
		const { user } = this.props;
		const { hasOtp } = user || {};
		const { phone } = this.state;

		if (!hasOtp) {
			return null;
		}

		return (
			<OtpModal
				ResendOtpTime={20}
				phone={phone}
				onClose={this.handleCloseOtpModal.bind(this)}
				getOtp={this.handleSubmitPhoneNumber.bind(this)}
				sendOtp={this.handleWebLogin.bind(this)}
			/>
		);
	}

	render() {
		const {
			user,
			title,
			className,
			onlineStoreInfo
		} = this.props;
		const {
			isFetching,
			isLogin,
		} = user || {};
		const { country } = onlineStoreInfo || {};
		const { phone } = this.state;
		const classList = ['aside'];

		if (className) {
			classList.push(className);
		}

		if (!isLogin) {
			classList.push('active');
		}

		return (
			<section className={classList.join(' ')}>
				<PhoneViewContainer
					className="aside-bottom not-full"
					title={title}
					phone={phone}
					country={country}
					buttonText="Continue"
					show={true}
					isLoading={isFetching}
					updatePhoneNumber={this.handleUpdatePhoneNumber.bind(this)}
					onSubmit={this.handleSubmitPhoneNumber.bind(this)}
				>
					<p className="terms-privacy text-center gray-font-opacity">
						By tapping to continue, you agree to our<br />
						<BrowserRouter basename="/">
							<Link target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}><strong>Terms of Service</strong></Link>, and <Link target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}><strong>Privacy Policy</strong></Link>.
							</BrowserRouter>
					</p>
				</PhoneViewContainer>
				{this.renderOtpModal()}

			</section>
		);
	}
}


Login.propTypes = {
	className: PropTypes.string,
	title: PropTypes.string,
};

Login.defaultProps = {
};

export default connect(
	(state) => ({
		user: getUser(state),
		onlineStoreInfo: getOnlineStoreInfo(state),
	}),
	(dispatch) => ({
		appActions: bindActionCreators(appActions, dispatch),
	})
)(Login);
