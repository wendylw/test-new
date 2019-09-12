import React from 'react';
import PhoneView from '../../../components/PhoneView';
import Utils from '../../../utils/utils';

import { connect } from 'react-redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';

class Login extends React.Component {
	state = {
		phone: Utils.getLocalStorageVariable('user.p'),
		isSavingPhone: false,
	}

	handleUpdatePhoneNumber(phone) {
		this.setState({ phone });
	}

	handleLogin() {

	}

	render() {
		const { onlineStoreInfo } = this.props;
		const { country } = onlineStoreInfo || {};
		const {
			isSavingPhone,
			phone,
		} = this.state;

		return (
			<div className="full-aside login">
				<aside className="aside-bottom not-full">
					<label className="phone-view-form__label text-center">
						Do you have a Beep account? Login with your mobile phone number.
					</label>
					<PhoneView
						phone={phone}
						country={country}
						setPhone={this.handleUpdatePhoneNumber.bind(this)}
						submitPhoneNumber={this.handleLogin.bind(this)}
						isLoading={isSavingPhone}
						buttonText="Continue"
					/>
					<button className="text-uppercase">Skip</button>
				</aside>
			</div>
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
