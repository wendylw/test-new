import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router";
import Utils from '../../../libs/utils';
import Constants from '../../../Constants';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import {
  sendVerificationMessage,
  tryOtpAndSaveCashback,
  fetchPhone,
  setPhone,
} from '../../actions';

import 'react-phone-number-input/style.css';

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
      // tryOtpAndSaveCashback(history);
      sendVerificationMessage(history);
    }
  }

  render() {
    const {
      phone,
      setPhone,
      country,
      isLoading,
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
            disabled={!phone || !isValidPhoneNumber(phone) || isLoading}
          >Continue</button>

          <p className="terms-privacy text-center gray-font-opacity">
            By tapping to continue, you agree to our
            <br />
            <Link target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}><strong>Terms of Service</strong></Link>, and <Link target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}><strong>Privacy Policy</strong></Link>.
          </p>
        </aside>
      </section>
    );
  }
}

const mapStateToProps = state => {
  const business = state.common.business || {};

  return {
    phone: state.user.phone,
    isLoading: state.user.isLoading,
    country: business.country,
  };
};

const mapDispathToProps = dispatch => bindActionCreators({
  sendVerificationMessage,
  tryOtpAndSaveCashback,
  fetchPhone,
  setPhone,
}, dispatch);

export default connect(mapStateToProps, mapDispathToProps)(
  withRouter(PhoneView)
);