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

const { API_URLS } = url;
class Profile extends Component {
  componentDidMount() {
    const { appActions, user } = this.props;
    const { consumerId } = user || {};
    consumerId && appActions.getProfileInfo(consumerId);
  }

  handleClickBack = () => {
    const newSearchParams = Utils.addParamToSearch('pageRefer', 'cart');
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      // search: window.location.search,
      search: newSearchParams,
    });
  };

  saveProfile = async () => {
    const { user, history, appActions } = this.props;
    const { consumerId, profile } = user || {};
    const { name, email, birthday } = profile || {};
    // appActions.createOrUpdateProfile();
    // const { name, date, email } = this.state;
    const createdUrl = API_URLS.CREATE_AND_UPDATE_PROFILE(consumerId);
    const data = {
      firstName: name,
      email: email,
      birthday: new Date(birthday).toISOString(),
    };
    const response = await put(createdUrl.url, data);
    const { success } = response;
    if (success) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
        search: window.location.search,
      });
    }
  };

  handleInputChange = e => {
    const inputValue = e.target.value;
    if (e.target.name === 'consumerName') {
      this.props.appActions.updateProfileInfo({ name: inputValue });
    } else if (e.target.name === 'consumerEmail') {
      this.props.appActions.updateProfileInfo({ email: inputValue });
    } else if (e.target.name === 'consumerBirthday') {
      this.props.appActions.updateProfileInfo({ birthday: inputValue });
    }
  };

  render() {
    const { t, user } = this.props;
    const { profile } = user || {};
    const { name, email, birthday } = profile || {};
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
              <div className="profile__input padding-small border-radius-base">
                <div>Email Address</div>
                <input
                  name="consumerEmail"
                  value={email}
                  className="form__input"
                  type="text"
                  onChange={this.handleInputChange}
                />
              </div>
              <div className="profile__input padding-small border-radius-base">
                <div>Date of Birth</div>
                <div className="flex flex-space-between">
                  {/*<div>*/}
                  {/*  {month}/{date}*/}
                  {/*</div>*/}
                  <div>
                    <input
                      name="consumerBirthday"
                      value={toISODateString(birthday)}
                      className="form__input"
                      type="date"
                      onChange={this.handleInputChange}
                    />
                  </div>
                </div>
              </div>
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
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Profile);
