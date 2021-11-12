import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../components/HybridHeader';
import Constants from '../../../utils/constants';
import { actions as appActionCreators, getUser, getDeliveryDetails } from '../../redux/modules/app';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { put } from '../../../utils/request';
import url from '../../../utils/url';
import Utils from '../../../utils/utils';
import './Profile.scss';

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
    const { history } = this.props;
    history.goBack();
  };

  gotoContactDetailPageIfNeeded = async () => {
    const { user, history, deliveryDetails, appActions } = this.props;

    if (Utils.isQROrder()) {
      history.goBack();
      return;
    }

    const { profile } = user || {};
    const { name, phone } = profile || {};
    const { username, phone: orderPhone } = deliveryDetails || {};
    const { ROUTER_PATHS } = Constants;
    !username && (await appActions.updateDeliveryDetails({ username: name }));
    !orderPhone && (await appActions.updateDeliveryDetails({ phone: phone }));
    history.push({
      pathname: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
      search: window.location.search,
    });
  };

  saveProfile = async () => {
    const { user, appActions } = this.props;
    const { consumerId, profile } = user || {};
    const { name, email } = profile || {};
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
        await this.gotoContactDetailPageIfNeeded();
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

  render() {
    const { t, user } = this.props;
    const { profile } = user || {};
    const { name, email } = profile || {};
    return (
      <div className="profile flex flex-column">
        <HybridHeader
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
                <div>{t('Name')}</div>
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
                <div>{t('EmailAddress')}</div>
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
