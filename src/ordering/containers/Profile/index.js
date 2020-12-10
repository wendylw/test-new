import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import { actions as appActionCreators, getUser } from '../../redux/modules/app';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { put } from '../../../utils/request';
import { toISODateString } from '../../../utils/datetime-lib';
import url from '../../../utils/url';
import './Profile.scss';
import { actions as customerActionCreators, getDeliveryDetails } from '../../redux/modules/customer';

import DayPicker from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

const { API_URLS } = url;
class Profile extends Component {
  state = {
    error: false,
    message: '',
  };
  componentDidMount() {
    const { appActions, user } = this.props;
    const { consumerId } = user || {};
    consumerId && appActions.getProfileInfo(consumerId);
  }

  handleClickBack = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART,
      search: window.location.search,
    });
  };

  saveProfile = async () => {
    const { user, history, deliveryDetails, customerActions } = this.props;
    const { consumerId, profile } = user || {};
    const { name, email, phone } = profile || {};
    const { username, phone: orderPhone } = deliveryDetails || {};

    let data = {};
    let createdUrl = API_URLS.CREATE_AND_UPDATE_PROFILE(consumerId);
    // let dateFormat = /^\d{4}-(\d{2})-(\d{2})$/;
    data.firstName = name;
    data.email = email;
    // if (birthday instanceof Date) {
    //   data.birthday = birthday.toISOString();
    // }

    try {
      const response = await put(createdUrl.url, data);
      const { success } = response;
      if (success) {
        !username && (await customerActions.patchDeliveryDetails({ username: name }));
        !orderPhone && (await customerActions.patchDeliveryDetails({ phone: phone }));
        history.push({
          pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
          search: window.location.search,
        });
      }
    } catch (e) {
      this.setState({ error: true, message: e.message });
      this.timeoutId = setTimeout(() => {
        this.setState({ error: false });
        clearTimeout(this.timeoutId);
      }, 3000);
      console.log(e);
    }
  };

  handleInputChange = e => {
    const inputValue = e.target.value;
    if (e.target.name === 'consumerName') {
      this.props.appActions.updateProfileInfo({ name: inputValue });
    } else if (e.target.name === 'consumerEmail') {
      this.props.appActions.updateProfileInfo({ email: inputValue });
    }
  };

  // handleDateChange = date => {
  //   this.props.appActions.updateProfileInfo({ birthday: date });
  // };

  render() {
    const { t, user } = this.props;
    const { profile } = user || {};
    const { name, email } = profile || {};
    return (
      <div className="profile flex flex-column">
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage={true}
          title={t('CompleteYourProfile')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <section className="profile__container padding-left-right-normal">
          <p className="margin-top-bottom-normal text-size-big text-line-height-base">{t('CompleteProfileTip')}</p>
          <div>
            <form>
              <div className="profile__input padding-small border-radius-base">
                <div>Name</div>
                <input
                  name="consumerName"
                  value={name}
                  className="form__input"
                  type="text"
                  required={true}
                  onChange={this.handleInputChange}
                />
              </div>
              {this.state.error && <p className="profile__error-message">{this.state.message}</p>}
              <div className={`profile__input padding-small border-radius-base ${this.state.error ? 'error' : ''}`}>
                <div>Email Address</div>
                <input
                  name="consumerEmail"
                  value={email}
                  className="form__input"
                  type="text"
                  onChange={this.handleInputChange}
                />
              </div>
              {/*<div className="profile__input padding-small border-radius-base">*/}
              {/*  <div>Date of Birth</div>*/}
              {/*  <div className="flex flex-space-between">*/}
              {/*    <DayPickerInput onDayChange={this.handleDateChange} value={toISODateString(birthday)} />*/}
              {/*  </div>*/}
              {/*</div>*/}
            </form>
          </div>
        </section>
        <footer className="footer footer__transparent margin-normal">
          <button
            className="button button__fill button__block padding-small text-size-big text-weight-bolder text-uppercase"
            disabled={!name}
            onClick={this.saveProfile}
          >
            {t('Continue')}
          </button>
        </footer>
      </div>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      deliveryDetails: getDeliveryDetails(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(Profile);
