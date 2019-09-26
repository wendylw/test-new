import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';

import { connect } from 'react-redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';

class Login extends React.Component {
	state = {};

	handleLogin() {

	}

	render() {
		const { onlineStoreInfo } = this.props;
		const { country } = onlineStoreInfo || {};

		return (
			<section className="aside">
				<PhoneViewContainer
					className="aside-bottom not-full"
					title="Do you have a Beep account? Login with your mobile phone number."
					country={country}
					buttonText="Continue"
					show={true}
					onSubmit={}
				>
					<p className="terms-privacy text-center gray-font-opacity">
						By tapping to continue, you agree to our<br />
						<BrowserRouter basename="/">
							<Link target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}><strong>Terms of Service</strong></Link>, and <Link target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}><strong>Privacy Policy</strong></Link>.
							</BrowserRouter>
					</p>
				</PhoneViewContainer>
				<OtpModal />
			</section>
		);
	}
}


Login.propTypes = {
};

Login.defaultProps = {
};

export default connect(
	(state) => {
		return {
			onlineStoreInfo: getOnlineStoreInfo(state),
		};
	}
)(Login);
