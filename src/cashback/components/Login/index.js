import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Link } from 'react-router-dom';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { getUser, getOnlineStoreInfo } from '../../redux/modules/app';

class Login extends React.Component {
	state = {};

	handleLogin() {

	}

	render() {
		const {
			user,
			title,
			className,
			onlineStoreInfo
		} = this.props;
		const { isLogin } = user || {};
		const { country } = onlineStoreInfo || {};
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
					country={country}
					buttonText="Continue"
					show={true}
					onSubmit={() => { }}
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
	className: PropTypes.string,
	title: PropTypes.string,
};

Login.defaultProps = {
};

export default connect(
	(state) => {
		return {
			user: getUser(state),
			onlineStoreInfo: getOnlineStoreInfo(state),
		};
	}
)(Login);
