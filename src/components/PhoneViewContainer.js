import React from 'react';
import PropTypes from 'prop-types';
import PhoneView from './PhoneView';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import 'react-phone-number-input/style.css';
import Utils from '../utils/utils';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

class PhoneViewContainer extends React.Component {
	state = {
		phone: Utils.getLocalStorageVariable('user.p'),
		isSavingPhone: false,
	}

	handleUpdatePhoneNumber(phone) {
		this.setState({ phone });
	}

	handleSubmitPhoneNumber() {
		const { onSubmit } = this.props;
		const { phone } = this.state;

		if (!isValidPhoneNumber(phone)) {
			return;
		}

		this.setState({ isSavingPhone: true });

		onSubmit(phone);
	}

	renderPhoneView() {
		const {
			buttonText,
			onlineStoreInfo,
		} = this.props;
		const {
			isSavingPhone,
			phone,
			errorMessage,
		} = this.state;
		const { country } = onlineStoreInfo || {};
		let buttonContent = buttonText;

		if (!country) {
			return null;
		}

		if (isSavingPhone) {
			buttonContent = <div className="loader"></div>;
		}

		return (
			<React.Fragment>
				<PhoneInput
					placeholder="Enter phone number"
					value={formatPhoneNumberIntl(phone)}
					country={country}
					metadata={metadataMobile}
					onChange={phone => {
						const selectedCountry = document.querySelector('.react-phone-number-input__country-select').value;

						this.handleUpdatePhoneNumber(Utils.getFormatPhoneNumber(phone, metadataMobile.countries[selectedCountry][0]));
					}}
				/>

				{
					errorMessage.phone
						? <span className="error">{errorMessage.phone}</span>
						: null
				}

				<button
					className="phone-view-form__button button__fill button__block border-radius-base font-weight-bold text-uppercase"
					onClick={this.handleSubmitPhoneNumber.bind(this)}
					disabled={!phone || isSavingPhone || !isValidPhoneNumber(phone)}
				>
					{buttonContent}
				</button>
			</React.Fragment>
		);
	}

	render() {
		const {
			children,
			title,
			className,
			country,
		} = this.props;
		const {
			isSavingPhone,
			phone,
		} = this.state;

		if (!country) {
			return null;
		}

		return (
			<aside className={className}>
				{
					title
						? <label className="phone-view-form__label text-center">{title}</label>
						: null
				}

				{this.renderPhoneView()}
				<PhoneView
					phone={phone}
					country={country}
					setPhone={this.handleUpdatePhoneNumber.bind(this)}
					submitPhoneNumber={this.handleSubmitPhoneNumber.bind(this)}
					isLoading={isSavingPhone}
					buttonText="Continue"
				/>
				{children}
			</aside>
		);
	}
}

PhoneViewContainer.propTypes = {
	className: PropTypes.string,
	title: PropTypes.string,
	country: PropTypes.string,
	buttonText: PropTypes.string,
	show: PropTypes.bool,
	onSubmit: PropTypes.func,
};

PhoneViewContainer.defaultProps = {
	show: false,
	country: 'MY',
};

export default PhoneViewContainer;