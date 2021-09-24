import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Constants from '../../../utils/constants';
import { actions as appActionCreators, getUser, getDeliveryDetails } from '../../redux/modules/app';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import './Profile.scss';
import Utils from '../../../utils/utils';
import DuplicatedEmailAlert from '../Profile/components/DuplicatedEmailAlert/DuplicatedEmailAlert.jsx';
import { actions as profileActionCreators } from './redux/index';
import {
  getUpdateProfileError,
  getProfileName,
  getProfileEmail,
  getProfileBirthday,
  getEmailInvalidErrorVisibility,
  getbirthdayInvalidErrorVisibility,
  getShowModal,
} from './redux/selectors';
import { saveProfileInfo } from './redux/thunk';
class CompleteProfileModal extends Component {
  state = {
    error: false,
    message: '',
  };
  async componentDidMount() {
    const { appActions, profileAction, user } = this.props;
    const { consumerId } = user || {};
    const getCookieAsk = Utils.getCookieVariable('do_not_ask');
    if (getCookieAsk === '1' || !consumerId) {
      return;
    }

    await appActions.getProfileInfo(consumerId);

    const { name, email, birthday } = this.props.user.profile || {};

    this.timer = setTimeout(() => {
      const showProfile = !name || !email || !birthday;
      this.props.profileAction.setModal(showProfile);
    }, 3000);

    profileAction.init({ name, email, birthday });
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  handleClickBack = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART,
      search: window.location.search,
    });
  };

  saveProfile = async () => {
    const { saveProfileInfo } = this.props;
    await saveProfileInfo();
    if (!this.props.updateProfileError) {
      this.closeProfileModal();
    }
  };

  handleInputChange = e => {
    const inputValue = e.target.value;
    if (e.target.name === 'consumerName') {
      this.props.profileAction.updateName(inputValue);
    } else if (e.target.name === 'consumerEmail') {
      this.props.profileAction.updateEmail(inputValue);
    } else if (e.target.name === 'consumerBirthday') {
      this.props.profileAction.updateBirthday(inputValue);
    }
  };

  closeProfileModal = () => {
    this.props.profileAction.setModal(false);
  };

  handleDoNotAsk = () => {
    Utils.setCookieVariable('do_not_ask', '1', {
      expires: 3650,
      path: '/',
      domain: Utils.getMainDomain(),
    });

    this.props.profileAction.doNotAskAgain();
  };

  handleBackEdit = () => {
    this.props.profileAction.resetUpdateProfileResult();
  };

  handleBirthdayInputBlur = () => {
    this.props.profileAction.completeBirthday();
  };

  handleEmailInputBlur = () => {
    this.props.profileAction.completeEmail();
  };

  handleEmailInputFocus = () => {
    this.props.profileAction.startEditEmail();
  };

  handleBirthdayInputFocus = () => {
    this.props.profileAction.startEditBirthday();
  };

  renderEmailField({ t, email }) {
    return (
      <div>
        <div className="flex__fluid-content">
          <div className="profile__title required">
            <span className="text-size-small text-top">{t('EmailAddress')}</span>
          </div>
        </div>
        <div
          className={`profile__email-input profile__PhoneInputCountry ${
            !this.props.emailInvalidErrorVisibility ? 'error' : ''
          } form__group margin-left-right-small border-radius-normal`}
        >
          <input
            name="consumerEmail"
            value={email}
            onChange={this.handleInputChange}
            onBlur={this.handleEmailInputBlur}
            className="profile__input-email form__input padding-small"
            onFocus={this.handleEmailInputFocus}
          />
        </div>
      </div>
    );
  }

  render() {
    const { t, showModal } = this.props;
    const email = this.props.profileEmail;
    const birthday = this.props.profileBirthday;
    const name = this.props.profileName;

    const className = ['aside fixed-wrapper', 'profile  flex flex-column flex-end'];

    if (showModal) {
      className.push('active cover');
    }

    return (
      <div>
        <DuplicatedEmailAlert
          show={this.props.updateProfileError?.code === '40024'}
          onDoNotAsk={this.handleDoNotAsk}
          onBackEdit={this.handleBackEdit}
          t={this.props.t}
        />
        <aside
          className={className.join(' ')}
          data-heap-name="ordering.home.profile.container"
          style={{ zIndex: '101' }}
        >
          <div className="profile flex flex-column profile__container aside__content">
            <section className="profile__container padding-left-right-normal">
              <div className="profile__flex">
                <div>
                  <p className="profile__complete_title profile__complete_title_two">{t('CompleteYourProfile')}</p>
                </div>
                <button className="profile__skip profile__button-link" onClick={this.closeProfileModal}>
                  {t('SkipForNow')}
                </button>
              </div>
              <p className="profile__margin-top-bottom-normal text-size-big text-line-height-base">
                {t('CompleteProfileTip')}
              </p>
              <div>
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
                    this.props.emailInvalidErrorVisibility ? 'error' : ''
                  } form__group margin-left-right-small border-radius-normal`}
                >
                  {this.renderEmailField({
                    t,
                    email,
                  })}
                </div>
                {this.props.emailInvalidErrorVisibility && (
                  <p className="profile__showError  form__error-message padding-left-right-normal margin-top-bottom-small">
                    {t('NotValidEmail')}
                  </p>
                )}
                <div
                  className={`profile__birthday profile__input padding-small border-radius-base padding-left-right-normal
                   ${this.props.birthdayInvalidErrorVisibility ? 'error' : ''}
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
                    onBlur={this.handleBirthdayInputBlur}
                    className="form__input"
                    placeholder="DD/MM"
                    type="text"
                    onChange={this.handleInputChange}
                    onFocus={this.handleBirthdayInputFocus}
                  />
                </div>
                {this.props.birthdayInvalidErrorVisibility && (
                  <p className="profile__showError_birthday  form__error-message padding-left-right-normal margin-top-bottom-small">
                    {t('NotValidBirthday')}
                  </p>
                )}
              </div>
            </section>
            <footer className="footer footer__transparent margin-normal">
              <button
                className="button button__fill button__block padding-small text-size-big text-weight-bolder text-uppercase"
                disabled={
                  !name ||
                  !birthday ||
                  !email ||
                  this.props.emailInvalidErrorVisibility ||
                  this.props.birthdayInvalidErrorVisibility
                }
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
CompleteProfileModal.displayName = 'CompleteProfileModal';

export default compose(
  withTranslation('Profile'),
  connect(
    state => ({
      user: getUser(state),
      profileName: getProfileName(state),
      profileEmail: getProfileEmail(state),
      profileBirthday: getProfileBirthday(state),
      showModal: getShowModal(state),
      deliveryDetails: getDeliveryDetails(state),
      updateProfileError: getUpdateProfileError(state),
      emailInvalidErrorVisibility: getEmailInvalidErrorVisibility(state),
      birthdayInvalidErrorVisibility: getbirthdayInvalidErrorVisibility(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      profileAction: bindActionCreators(profileActionCreators, dispatch),
      saveProfileInfo: bindActionCreators(saveProfileInfo, dispatch),
    })
  )
)(CompleteProfileModal);
