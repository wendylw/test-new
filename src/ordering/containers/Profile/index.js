import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Constants from '../../../utils/constants';
import { actions as appActionCreators, getUser, getDeliveryDetails } from '../../redux/modules/app';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import './Profile.scss';
import Utils from '../../../utils/utils';
import 'react-day-picker/lib/style.css';
import AlertWarning from '../AlertWarning/AlertWarning';
import _trim from 'lodash/trim';
import { actions as profileActionCreators } from './redux/index';
import { getUpdateProfileError, getProfile, getShowModal } from './redux/selectors';
import { updateProfile } from './redux/thunk';
class Profile extends Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }
  inputRefOfEmail = null;
  state = {
    error: false,
    message: '',
    ifDisplay: '',
  };
  async componentDidMount() {
    const { appActions, profileAction, user } = this.props;
    const { consumerId } = user || {};
    consumerId && (await appActions.getProfileInfo(consumerId));

    const { name, email, birthday } = this.props.user.profile || {};

    setTimeout(() => {
      const showProfile = !name || !email || !birthday;
      this.props.profileAction.setModal(showProfile);
    }, 3000);

    profileAction.updateProfileInfo({ name, email, birthday });
  }

  handleClickBack = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART,
      search: window.location.search,
    });
  };

  saveProfile = async () => {
    const { updateProfile } = this.props;
    await updateProfile();
    if (!this.props.updateProfileError) {
      this.skipProfile();
    } else if (this.props.updateProfileError.code) {
      if (this.props.updateProfileError.code == '40024') {
        return;
      }
    }
  };

  handleInputChange = e => {
    const inputValue = e.target.value;
    if (e.target.name === 'consumerName') {
      this.props.profileAction.updateProfileInfo({ name: inputValue });
    } else if (e.target.name === 'consumerBirthday') {
      this.props.profileAction.updateProfileInfo({ birthday: inputValue });
    } else if (e.target.name === 'consumerEmail') {
      this.props.profileAction.updateProfileInfo({ email: inputValue });
    }
  };

  skipProfile = () => {
    this.props.profileAction.setModal(false);
  };

  handleHideProductDetail(e) {
    if (e && e.target !== e.currentTarget) {
      return;
    }

    this.closeModal();
  }

  handleDonotAsk = () => {
    Utils.setCookieVariableChange('a_sk', '1', {
      expires: 3650,
      path: '/',
      domain: Utils.getMainDomain(),
    });

    this.setState({
      ifDisplay: true,
    });
  };

  handleBackEdit = () => {
    this.props.profileAction.resetUpdateProfileResult();
  };

  renderEmailFiled({ t, email, disabled }) {
    let emailTrim = _trim(email);
    const showInvalidError = emailTrim && !Utils.checkEmailIsValid(emailTrim);
    return (
      <div>
        <div className="flex__fluid-content">
          <div className="profile__title required">
            <span className="text-size-small text-top">{t('EmailAddress')}</span>
          </div>
        </div>
        <div
          className={`profile__email-input profile__PhoneInputCountry ${
            showInvalidError ? 'error' : ''
          } form__group margin-left-right-small border-radius-normal`}
        >
          <input
            ref={ref => (this.inputRefOfEmail = ref)}
            disabled={disabled}
            name="consumerEmail"
            value={email}
            onChange={this.handleInputChange}
            onBlur={this.handleEmailInputBlur}
            className="ordering-report-driver__input-email form__input padding-small"
          />
        </div>
      </div>
    );
  }

  render() {
    const { t, showModal } = this.props;
    const { name, email, birthday } = this.props.profile;
    let disabled;
    let emailTrim = _trim(email);
    let birthdayTrim = _trim(birthday);
    const showInvalidError = emailTrim && !Utils.checkEmailIsValid(emailTrim);
    const showInvalidBirthday = birthdayTrim && !Utils.checkBirthdayIsValid(birthday);

    const className = ['aside fixed-wrapper', 'profil  flex flex-column flex-end'];

    if (showModal) {
      className.push('active cover');
    }

    return (
      <div style={{ opacity: this.state.ifDisplay || Utils.getCookieVariableChange('a_sk') ? '0' : '1' }}>
        <div>
          <AlertWarning
            show={this.props.updateProfileError?.code === '40024'}
            onDonotAsk={this.handleDonotAsk}
            onBackEdit={this.handleBackEdit}
            t={this.props.t}
          />
        </div>

        <aside
          ref={ref => (this.asideEl = ref)}
          className={className.join(' ')}
          onClick={e => this.handleHideProductDetail(e)}
          data-heap-name="ordering.home.profile.container"
        >
          <div ref={this.textInput} className="profile flex flex-column profile__container aside__content">
            <section className="profile__container padding-left-right-normal">
              <div className="profile__flex">
                <div>
                  <p className="profile__complete_title profile__complete_title_two">{t('Complete')}</p>
                  <p className="profile__complete_title ">{t('YourProfile')}</p>
                </div>
                <a className="profile__skip" onClick={this.skipProfile}>
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
                  <div
                    className={`profile__position profile__input padding-small border-radius-base padding-left-right-normal profile__email-input profile__PhoneInputCountry ${
                      showInvalidError ? 'error' : ''
                    } form__group margin-left-right-small border-radius-normal`}
                  >
                    {this.renderEmailFiled({
                      t,
                      disabled,
                      email,
                    })}
                  </div>
                  {showInvalidError && (
                    <p className="profile__showError  form__error-message padding-left-right-normal margin-top-bottom-small">
                      {t('NotValidEmail')}
                    </p>
                  )}
                  <div
                    className={`profile__birthday profile__input padding-small border-radius-base padding-left-right-normal
                   ${showInvalidBirthday ? 'error' : ''}
                    `}
                  >
                    <div className="flex__fluid-content">
                      <div className="profile__title required">
                        <span className="text-size-small text-top">{t('DateOfBirth')}</span>
                      </div>
                    </div>
                    <input
                      name="consumerBirthday"
                      value={birthday}
                      className="form__input"
                      placeholder="DD/MM"
                      type="text"
                      onChange={this.handleInputChange}
                    />
                  </div>
                  {showInvalidBirthday && (
                    <p className="profile__showError_birthday  form__error-message padding-left-right-normal margin-top-bottom-small">
                      {t('NotValidBirthday')}
                    </p>
                  )}
                </form>
              </div>
            </section>
            <footer className="footer footer__transparent margin-normal">
              <button
                className="button button__fill button__block padding-small text-size-big text-weight-bolder text-uppercase"
                disabled={!name || showInvalidError || !email || !birthday || showInvalidBirthday}
                onClick={this.saveProfile}
              >
                {t('Continue')}
              </button>
            </footer>
          </div>
        </aside>
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
      profile: getProfile(state),
      showModal: getShowModal(state),
      deliveryDetails: getDeliveryDetails(state),
      updateProfileError: getUpdateProfileError(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      profileAction: bindActionCreators(profileActionCreators, dispatch),
      updateProfile: bindActionCreators(updateProfile, dispatch),
    })
  )
)(Profile);
