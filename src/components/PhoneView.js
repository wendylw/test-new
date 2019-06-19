import React from 'react';
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
    const { phone, setPhone, country } = this.props;

    return (
      <section className="asdie-section">
        <aside className="aside-bottom not-full">
          <label className="cash-back-form__label text-center">Claim with your mobile number</label>
          <PhoneInput
            placeholder="Enter phone number"
            value={phone}
            country={country}
            onChange={phone => setPhone(phone)}
          />
          <button
            className="cash-back-form__button button__fill button__block border-radius-base font-weight-bold text-uppercase"
            onClick={this.submitPhoneNumber.bind(this)}
            disabled={!phone}
          >Continue</button>
        </aside>
      </section>
    );
  }
}

PhoneView.propTypes = {
	phone: PropTypes.string,
	country: PropTypes.string,
	setPhone: PropTypes.func,
};

export default PhoneView;