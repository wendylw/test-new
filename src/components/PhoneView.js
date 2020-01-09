import React from 'react';
import PropTypes from 'prop-types';
import 'react-phone-number-input/style.css';
import Utils from '../utils/utils';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

class PhoneView extends React.Component {
  state = {
    isLoading: this.props.isLoading,
    errorMessage: {
      phone: null,
    },
  };

  componentWillReceiveProps(nextProps) {
    const { isLoading } = nextProps;

    if (isLoading !== this.state.isLoading) {
      this.setState({ isLoading });
    }
  }

  async savePhoneNumber() {
    const { submitPhoneNumber, phone } = this.props;

    alert('test');

    if (!isValidPhoneNumber(phone)) {
      return;
    }

    await Utils.setLocalStorageVariable('user.p', phone);
    this.setState({ isLoading: true });

    submitPhoneNumber();
  }

  render() {
    const { className, phone, setPhone, country, buttonText } = this.props;
    const { isLoading, errorMessage } = this.state;
    let buttonContent = buttonText;

    if (isLoading) {
      buttonContent = <div className="loader"></div>;
    }

    return (
      <div className={className}>
        <PhoneInput
          placeholder="Enter phone number"
          value={formatPhoneNumberIntl(phone)}
          country={country}
          metadata={metadataMobile}
          onChange={phone => {
            const selectedCountry = document.querySelector('.react-phone-number-input__country-select').value;

            if (metadataMobile.countries[selectedCountry]) {
              setPhone(Utils.getFormatPhoneNumber(phone, metadataMobile.countries[selectedCountry][0]));
            }
          }}
        />

        {errorMessage.phone ? <span className="error">{errorMessage.phone}</span> : null}

        <button
          className="phone-view-form__button button__fill button__block border-radius-base font-weight-bold text-uppercase"
          onClick={this.savePhoneNumber.bind(this)}
          disabled={!phone || isLoading || !isValidPhoneNumber(phone)}
        >
          {buttonContent}
        </button>
      </div>
    );
  }
}

PhoneView.propTypes = {
  className: PropTypes.string,
  phone: PropTypes.string,
  country: PropTypes.string,
  submitPhoneNumber: PropTypes.func,
  setPhone: PropTypes.func,
  isLoading: PropTypes.bool,
  buttonText: PropTypes.string,
};

PhoneView.defaultProps = {
  isLoading: false,
  submitPhoneNumber: () => {},
};

export default PhoneView;
