import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router";
import 'react-phone-number-input/style.css';
import Utils from '../../../libs/utils';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { tryOtpAndSaveCashback, fetchPhone, setPhone } from '../../actions';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

class PhoneView extends React.Component {
  state = {
    showVerify: false,
  }

  componentWillMount() {
    const { fetchPhone } = this.props;
    fetchPhone();
  }

  toggleVerifyModal(flag) {
    if (typeof flag === 'boolean') {
      this.setState({ showVerify: flag });
      return;
    }

    this.setState({ showVerify: !this.state.showVerify });
  }

  async submitPhoneNumber() {
    const {
      phone,
      history,
      tryOtpAndSaveCashback,
    } = this.props;

    if (isValidPhoneNumber(phone)) {
      tryOtpAndSaveCashback(history);
    }
  }

  render() {
    const {
      phone,
      setPhone,
      country,
    } = this.props;

    return (
      <section className="asdie-section">
        <aside className="aside-bottom not-full">
          <label className="phone-view-form__label text-center">Claim with your mobile number</label>
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
          <button
            className="phone-view-form__button button__fill button__block border-radius-base font-weight-bold text-uppercase"
            onClick={this.submitPhoneNumber.bind(this)}
            disabled={!phone || !isValidPhoneNumber(phone)}
          >Continue</button>
        </aside>
      </section>
    );
  }
}

const mapStateToProps = state => {
  const business = state.common.business || {};

  return {
    phone: state.user.phone,
    country: business.country,
  };
};

const mapDispathToProps = dispatch => bindActionCreators({
  tryOtpAndSaveCashback,
  fetchPhone,
  setPhone,
}, dispatch);

export default connect(mapStateToProps, mapDispathToProps)(
  withRouter(PhoneView)
);