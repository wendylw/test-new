import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router";
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import PhoneVerifyModal from './PhoneVerifyModal';
import api from '../../utils/api';
import { sendMessage } from '../../actions';
import CashbackConstans from '../../utils/Constants';

class PhoneView extends React.Component {
  state = {
    phone: '',
    showVerify: false,
    disableSubmit: false,
  }

  toggleVerifyModal(flag) {
    if (typeof flag === 'boolean') {
      this.setState({ showVerify: flag });
      return;
    }

    this.setState({ showVerify: !this.state.showVerify });
  }

  async submitPhoneNumber() {
    const { sendMessage } = this.props;

    this.setState({ disableSubmit: true });

    const { ok } = await api({
      url: CashbackConstans.api.CODE,
      method: 'post',
      data: {
        phone: this.state.phone,
      },
    });

    this.setState({ disableSubmit: false });

    if (ok) {
      this.toggleVerifyModal(true);
      return;
    } else {
      sendMessage('Oops! OTP not sent, please check your phone number and send again.');
    }
  }

  render() {
    return (
      <section className="asdie-section">
        <aside className="aside-bottom">
          <label className="cash-back-form__label text-center">Claim with your mobile phone number</label>
          <PhoneInput
            placeholder="Enter phone number"
            value={this.state.phone}
            country={this.props.country}
            onChange={ phone => this.setState({ phone })}
          />
          <button
            className="cash-back-form__button button__fill button__block border-radius-base font-weight-bold text-uppercase"
            onClick={this.submitPhoneNumber.bind(this)}
            disabled={this.state.disableSubmit}
          >Continue</button>
        </aside>

        {
          this.state.showVerify ? (
            <PhoneVerifyModal
              phone={this.state.phone}
              onClose={this.toggleVerifyModal.bind(this, false)}
              onSuccess={() => this.toggleVerifyModal(false)}
              show
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
  };
};

const mapDispathToProps = dispatch => bindActionCreators({
  sendMessage,
}, dispatch);

export default connect(mapStateToProps, mapDispathToProps)(
  withRouter(PhoneView)
);