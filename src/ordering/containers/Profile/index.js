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
  getDuplicatedEmailAlertVisibile,
} from './redux/selectors';
import { saveProfileInfo } from './redux/thunk';
import * as NativeMethods from '../../../utils/native-methods';
import { withBackButtonSupport } from '../../../utils/modal-back-button-support';
class CompleteProfileModal extends Component {
  state = {
    nativeMethodExist: true,
  };

  async componentDidMount() {
    this.initCompleteProfileIfNeeded();
  }

  componentDidUpdate(prevProps) {
    if (this.props.showProfileVisibility !== prevProps.showProfileVisibility) {
      this.props.onModalVisibilityChanged(this.props.showProfileVisibility);
      if (Utils.isWebview() && this.props.showProfileVisibility) {
        this.showNativeCompleteProfilePage();
      }
    }

    if (this.props.user.profile !== prevProps.user.profile) {
      this.initCompleteProfileIfNeeded();
    }
  }

  initCompleteProfileIfNeeded = () => {
    const { profileAction } = this.props;

    const { name, email, birthday, status } = this.props.user.profile || {};

    if (status === 'fulfilled') {
      profileAction.init({ name, email, birthday });
    }
  };

  async showNativeCompleteProfilePage() {
    try {
      const result = await NativeMethods.showCompleteProfilePageAsync();
      const { appActions, user } = this.props;
      const { consumerId } = user || {};
      if (result?.fulfilled) {
        appActions.getProfileInfo(consumerId);
      }
      this.closeProfileModal();
    } catch (error) {
      const nativeMethodNotExist = error.code === NativeMethods.NATIVE_API_ERROR_CODES.METHOD_NOT_EXIST;
      this.setState({
        nativeMethodExist: !nativeMethodNotExist,
      });
    }
  }

  handleClickBack = () => {
    const { history } = this.props;
    history.goBack();
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
    this.props.closeModal();
  };

  onHistoryBackReceived = () => {
    this.props.closeModal();
  };

  handleDoNotAsk = () => {
    Utils.setCookieVariable('do_not_ask', '1', {
      expires: 3650,
      path: '/',
      domain: Utils.getMainDomain(),
    });

    this.props.profileAction.doNotAskAgain();
    this.closeProfileModal();
  };

  handleBackEdit = () => {
    this.props.profileAction.resetUpdateProfileResult();
  };

  handleNameInputBlur = () => {
    this.props.profileAction.completeName();
  };

  handleBirthdayInputBlur = () => {
    this.props.profileAction.completeBirthday();
  };

  handleEmailInputBlur = () => {
    this.props.profileAction.completeEmail();
  };

  handleNameInputFocus = () => {
    this.props.profileAction.startEditName();
  };

  handleEmailInputFocus = () => {
    this.props.profileAction.startEditEmail();
  };

  handleBirthdayInputFocus = () => {
    this.props.profileAction.startEditBirthday();
  };

  render() {
    const {
      t,
      showProfileVisibility,
      duplicatedEmailAlertVisibile,
      profileEmail: email,
      profileBirthday: birthday,
      profileName: name,
    } = this.props;

    const className = ['aside fixed-wrapper', 'profile flex flex-column flex-end'];

    if (Utils.isWebview() && this.state.nativeMethodExist) {
      return null;
    }

    if (showProfileVisibility) {
      className.push('active cover');
    }

    return (
      <div>
        <DuplicatedEmailAlert
          show={duplicatedEmailAlertVisibile}
          onDoNotAsk={this.handleDoNotAsk}
          onBackEdit={this.handleBackEdit}
          t={this.props.t}
        />
        <aside className={className.join(' ')} data-heap-name="ordering.home.profile.container">
          <div className="profile flex flex-column flex-space-between aside__content">
            <section>
              <div className="padding-top-bottom-smaller padding-left-right-normal text-right">
                <button
                  className="button button__link text-size-big padding-top-bottom-normal flex__shrink-fixed"
                  onClick={this.closeProfileModal}
                >
                  {t('SkipForNow')}
                </button>
              </div>
              <div className="padding-top-bottom-smaller padding-left-right-normal">
                <h2 className="profile__title padding-top-bottom-normal text-size-huge text-weight-bolder">
                  {t('CompleteYourProfile')}
                </h2>
                <p className="profile__tip-color text-size-big text-line-height-base">{t('CompleteProfileTip')}</p>
              </div>
              <div className="padding-left-right-normal">
                <div className="padding-top-bottom-smaller margin-top-bottom-normal">
                  <div className="form__group padding-small border-radius-base padding-left-right-normal ">
                    <div className="profile__label profile__input--required">
                      <label className="profile__label text-size-small text-top">{t('Name')}</label>
                    </div>
                    <input
                      name="consumerName"
                      value={name}
                      className="profile__input form__input"
                      type="text"
                      required={true}
                      onChange={this.handleInputChange}
                      onFocus={this.handleNameInputFocus}
                      onBlur={this.handleNameInputBlur}
                    />
                  </div>
                </div>
                <div className="padding-top-bottom-small margin-top-bottom-normal">
                  <div
                    className={`form__group padding-small border-radius-base padding-left-right-normal
                  ${this.props.emailInvalidErrorVisibility ? 'error' : ''}
                   `}
                  >
                    <div className=" profile__label profile__input--required">
                      <label className="profile__label text-size-small text-top">{t('EmailAddress')}</label>
                    </div>
                    <input
                      name="consumerEmail"
                      value={email}
                      onChange={this.handleInputChange}
                      onBlur={this.handleEmailInputBlur}
                      className={`profile__input form__input
                  ${this.props.emailInvalidErrorVisibility ? 'text-error' : ''}
                   `}
                      onFocus={this.handleEmailInputFocus}
                    />
                  </div>
                  {this.props.emailInvalidErrorVisibility && (
                    <p className="profile__input-message--error form__error-message padding-top-bottom-smaller">
                      {t('NotValidEmail')}
                    </p>
                  )}
                </div>
                <div className="padding-top-bottom-small margin-top-bottom-normal ">
                  <div
                    className={`profile__birthday profile__input-next padding-small border-radius-base padding-left-right-normal
                    ${this.props.birthdayInvalidErrorVisibility ? 'error' : ''}
                     `}
                  >
                    <div className=" profile__label profile__input--required">
                      <label className="profile__label text-size-small text-top">{t('DateOfBirth')}</label>
                    </div>
                    <input
                      name="consumerBirthday"
                      value={birthday}
                      onBlur={this.handleBirthdayInputBlur}
                      className={`profile__input form__input
                  ${this.props.birthdayInvalidErrorVisibility ? 'text-error' : ''}
                   `}
                      placeholder="DD/MM"
                      type="text"
                      onChange={this.handleInputChange}
                      onFocus={this.handleBirthdayInputFocus}
                    />
                  </div>
                  {this.props.birthdayInvalidErrorVisibility && (
                    <p className="profile__input-message--error form__error-message padding-top-bottom-smaller">
                      {t('NotValidBirthday')}
                    </p>
                  )}
                </div>
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
      deliveryDetails: getDeliveryDetails(state),
      updateProfileError: getUpdateProfileError(state),
      emailInvalidErrorVisibility: getEmailInvalidErrorVisibility(state),
      birthdayInvalidErrorVisibility: getbirthdayInvalidErrorVisibility(state),
      duplicatedEmailAlertVisibile: getDuplicatedEmailAlertVisibile(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      profileAction: bindActionCreators(profileActionCreators, dispatch),
      saveProfileInfo: bindActionCreators(saveProfileInfo, dispatch),
    })
  ),
  withBackButtonSupport
)(CompleteProfileModal);
