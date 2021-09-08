import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../components/HybridHeader';
import Constants from '../../../utils/constants';
import { actions as appActionCreators, getUser, getDeliveryDetails } from '../../redux/modules/app';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { put } from '../../../utils/request';
import url from '../../../utils/url';
import './Profile.scss';
import Utils from '../../../../src/utils/utils';
// import DayPicker from 'react-day-picker';
// import DayPickerInput from 'react-day-picker/DayPickerInput';
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
    const { user, history, deliveryDetails, appActions } = this.props;
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
        !username && (await appActions.updateDeliveryDetails({ username: name }));
        !orderPhone && (await appActions.updateDeliveryDetails({ phone: phone }));
        // history.push({
        //   pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
        //   search: window.location.search,
        // });
        history.push({
          pathname: Constants.ROUTER_PATHS.ORDERING_ONLINE_SAVED_CARDS,
          search: window.location.search,
        });
      }
    } catch (e) {
      if (e.code) {
        appActions.showApiErrorModal(e.code);
      }

      this.setState({ error: true, message: e.message });
      this.timeoutId = setTimeout(() => {
        this.setState({ error: false });
        clearTimeout(this.timeoutId);
      }, 3000);
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

  focusMethod = () => {
    const profile__email = document.getElementById('profile__email');
    profile__email.focus();
    profile__email.style.border = '1px solid #FA4133';
    const notValidEmail = document.getElementById('notValidEmail');
    notValidEmail.style.display = 'block';
    const input_email = document.getElementById('input_email');
    // input_email.style.border = '1px solid #FA4133';
    input_email.style.color = 'red';
  };

  notFocusMethod = () => {
    const profile__email = document.getElementById('profile__email');
    const notValidEmail = document.getElementById('notValidEmail');
    notValidEmail.style.display = 'none';
    profile__email.style.border = '1px solid #dededf';
    const input_email = document.getElementById('input_email');
    input_email.style.color = '#303030';
  };

  handleEmailInputBlur = () => {
    const email = document.getElementById('input_email').value;
    const verifyEmail = Utils.checkEmailIsValid(email);
    console.log(Utils.checkEmailIsValid(email)); // true false
    if (verifyEmail) {
      this.notFocusMethod();
    } else {
      this.focusMethod();
    }
    // Utils.checkEmailIsValid(email)
  };

  skipProfile = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.THANK_YOU,
      search: window.location.search,
    });
  };

  render() {
    const { t, user } = this.props;
    const { profile } = user || {};
    const { name, email, birthday } = profile || {};
    return (
      <div className="profile flex flex-column">
        {/* <HybridHeader
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage={true}
          title={t('CompleteYourProfile')}
          navFunc={this.handleClickBack.bind(this)}
        /> */}
        <section className="profile__container padding-left-right-normal">
          <div className="profile__flex">
            <div>
              <p className="profile__complete_title profile__complete_title_two">{t('Complete')}</p>
              <p className="profile__complete_title ">{t('YourProfile')}</p>
            </div>
            <a href="#" className="profile__skip" onClick={this.skipProfile}>
              {t('SkipForNow')}
            </a>
          </div>
          <p className="profile__margin-top-bottom-normal text-size-big text-line-height-base">
            {t('CompleteProfileTip')}
          </p>
          <div>
            <form>
              <div className="profile__input padding-small border-radius-base padding-left-right-normal">
                <div className="flex__fluid-content">
                  <div className="profile__title required">
                    <span className="text-size-small text-top">{t('Name')}</span>
                  </div>
                </div>
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
              <div
                id="profile__email"
                className={`profile__input padding-small border-radius-base padding-left-right-normal ${
                  this.state.error ? 'error' : ''
                }`}
              >
                <div className="flex__fluid-content">
                  <div className="profile__title required">
                    <span className="text-size-small text-top">{t('EmailAddress')}</span>
                  </div>
                </div>
                <input
                  id="input_email"
                  name="consumerEmail"
                  value={email}
                  className="form__input"
                  type="text"
                  onChange={this.handleInputChange}
                  onBlur={this.handleEmailInputBlur}
                />
              </div>
              <p id="notValidEmail" className="profile__not-valid">
                {t('NotValidEmail')}
              </p>
              <div
                className={`profile__input padding-small border-radius-base padding-left-right-normal ${
                  this.state.error ? 'error' : ''
                }`}
              >
                <div className="flex__fluid-content">
                  <div className="profile__title required">
                    <span className="text-size-small text-top">{t('DateOfBirth')}</span>
                  </div>
                </div>
                <input
                  name="consumerEmail"
                  value={birthday}
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
            disabled={!name || !Utils.checkEmailIsValid(email)}
            onClick={this.saveProfile}
          >
            {t('Continue')}
          </button>
        </footer>
      </div>
    );
  }
}
Profile.displayName = 'Profile';

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      deliveryDetails: getDeliveryDetails(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Profile);
