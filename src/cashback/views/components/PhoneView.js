import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router";
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import PhoneVerifyModal from './PhoneVerifyModal';
import api from '../../utils/api';
import Constants from '../../utils/Constants';
import { setUserInfo, sendMessage } from '../../actions';

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
    this.setState({ disableSubmit: true });

    const { ok } = await api({
      url: Constants.api.CODE,
      method: 'post',
      data: {
        number: this.state.phone,
      },
    });

    this.setState({ disableSubmit: false });

    if (ok) {
      this.toggleVerifyModal(true);
      return;
    }
  }

  async onPhoneVerified() {
    const { history } = this.props;

    const { ok, data } = await api({
      url: Constants.api.USERS,
      method: 'post',
      data: {
        phone: this.state.phone,
      }
    });

    if (ok) {
      this.props.setUserInfo(data);
      this.toggleVerifyModal(false);

      this.props.sendMessage(`Awesome, you've collected your first cashback! To learn more about your rewards, tap the card below`);
      history.push('/loyalty');
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
              onSuccess={this.onPhoneVerified.bind(this)}
              show
            />
          ) : null
        }
      </section>
    );
  }
}

const mapStateToProps = state => ({
  locale: (state.home.storeInfo || {}).locale,
});

const mapDispathToProps = dispatch => bindActionCreators({
  setUserInfo,
  sendMessage,
}, dispatch);

export default connect(mapStateToProps, mapDispathToProps)(
  withRouter(PhoneView)
);