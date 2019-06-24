import React from 'react';
import PropTypes from 'prop-types';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'


class PhoneView extends React.Component {
  state = {
    showVerify: false,
  }

  toggleVerifyModal(flag) {
    if (typeof flag === 'boolean') {
      this.setState({ showVerify: flag });
      return;
    }

    this.setState({ showVerify: !this.state.showVerify });
  }

  async submitPhoneNumber() {
    const { history, tryOtpAndSaveCashback } = this.props;

    tryOtpAndSaveCashback(history);
  }

  render() {
    const { className, label, phone, setPhone, country } = this.props;

    return (
      <div className={className}>
        <label className="phone-view-form__label text-center">{label}</label>
        <PhoneInput
          placeholder="Enter phone number"
          value={phone}
          country={country}
          onChange={phone => setPhone(phone)}
        />
        <button
          className="phone-view-form__button button__fill button__block border-radius-base font-weight-bold text-uppercase"
          onClick={this.submitPhoneNumber.bind(this)}
          disabled={!phone}
        >Continue</button>
      </div>
    );
  }
}

PhoneView.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  phone: PropTypes.string,
  country: PropTypes.string,
  tryOtpAndSaveCashback: PropTypes.func,
  setPhone: PropTypes.func,
};

export default PhoneView;