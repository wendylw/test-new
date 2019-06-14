import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router";
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import PhoneVerifyModal from './PhoneVerifyModal';
import { tryOtpAndSaveCashback } from '../../actions';


class PhoneView extends React.Component {
  state = {
    phone: '',
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
    const { phone } = this.state;

    tryOtpAndSaveCashback(phone, history);
  }

  render() {
    const { otpStatus } = this.props;

    return (
      <section className="asdie-section">
        <aside className="aside-bottom not-full">
          <label className="cash-back-form__label text-center">Claim with your mobile number</label>
          <PhoneInput
            placeholder="Enter phone number"
            value={this.state.phone}
            country={this.props.country}
            onChange={ phone => this.setState({ phone })}
          />
          <button
            className="cash-back-form__button button__fill button__block border-radius-base font-weight-bold text-uppercase"
            onClick={this.submitPhoneNumber.bind(this)}
            disabled={otpStatus === 'sending' || !this.state.phone}
          >Continue</button>
        </aside>

        {
          this.state.showVerify ? (
            <PhoneVerifyModal
              phone={this.state.phone}
              onClose={this.toggleVerifyModal.bind(this, false)}
              onSuccess={() => this.toggleVerifyModal(false)}
              onResendClick={this.submitPhoneNumber.bind(this)}
            />
          ) : null
        }
      </section>
    );
  }
}

const mapStateToProps = state => {
  const onlineStoreInfo = state.common.onlineStoreInfo || {};

  return {
    locale: onlineStoreInfo.locale,
    country: onlineStoreInfo.country,
    otpStatus: state.user.otpStatus,
  };
};

const mapDispathToProps = dispatch => bindActionCreators({
  tryOtpAndSaveCashback,
}, dispatch);

export default connect(mapStateToProps, mapDispathToProps)(
  withRouter(PhoneView)
);