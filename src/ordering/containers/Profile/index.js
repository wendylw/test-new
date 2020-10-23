import React, { Component } from 'react';
// import DatePicker from 'react-datepicker';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import './Profile.scss';
import 'react-datepicker/dist/react-datepicker.css';
// import { IconKeyArrowDown } from '../../../components/Icons';
import { getUser } from '../../redux/modules/app';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { put } from '../../../utils/request';
import url from '../../../utils/url';

const { API_URLS } = url;
class Profile extends Component {
  state = {
    email: '',
    name: '',
    date: '',
  };

  componentDidMount() {
    const { user } = this.props;
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
    const { user, history } = this.props;
    const { consumerId } = user || {};
    const { name, date, email } = this.state;
    const demo = API_URLS.CREATE_AND_UPDATE_PROFILE(consumerId);
    const data = {
      firstName: name,
      email: email,
      birthday: new Date(date).toISOString(),
    };
    const response = await put(demo.url, data);
    const { success } = response;
    if (success) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
        search: window.location.search,
      });
    }
  };

  render() {
    const { t } = this.props;
    const { name, month, date, email } = this.state;
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
                  className="form__input"
                  type="text"
                  required={true}
                  onChange={e => {
                    this.setState({ name: e.target.value });
                  }}
                />
              </div>
              <div className="profile__input padding-small border-radius-base">
                <div>Email Address</div>
                <input
                  className="form__input"
                  type="text"
                  onChange={e => {
                    this.setState({ email: e.target.value });
                  }}
                />
              </div>
              <div className="profile__input padding-small border-radius-base">
                <div>Date of Birth</div>
                <div className="flex flex-space-between">
                  {/*<div>*/}
                  {/*  {month}/{date}*/}
                  {/*</div>*/}
                  <div>
                    {/*<IconKeyArrowDown />*/}
                    <input
                      className="form__input"
                      type="date"
                      onChange={e => {
                        console.log('date', e.target.value);
                        this.setState({ date: e.target.value });
                      }}
                    />

                    {/*<DatePicker className="form__input" onChange={this.handleDateChange}>*/}
                    {/*  <IconKeyArrowDown />*/}
                    {/*</DatePicker>*/}
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
    dispatch => ({})
  )
)(Profile);
