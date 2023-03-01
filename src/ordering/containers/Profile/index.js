import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  actions as appActionCreators,
  getUser,
  getDeliveryDetails,
  getIsUserProfileStatusPending,
} from '../../redux/modules/app';
import Utils from '../../../utils/utils';
import DuplicatedEmailAlert from './components/DuplicatedEmailAlert';
import {
  getUpdateProfileError,
  getEmailInvalidErrorVisibility,
  // getBirthdayInvalidErrorVisibility,
  // getDuplicatedEmailAlertVisibility,
  // new
  getIsProfileVisibility,
  getProfileName,
  getNameErrorType,
  getIsNameInputErrorDisplay,
  getProfileEmail,
  getEmailErrorType,
  getIsEmailInputErrorDisplay,
  getProfileBirthday,
  getBirthdayErrorType,
  getIsBirthdayInputErrorDisplay,
  getIsLaptopSafari,
  getIsDisabledProfileSubmit,
} from './redux/selectors';
import { init, profileUpdated } from './redux/thunk';
import { actions as profileActions } from './redux';
import { PROFILE_BIRTHDAY_FORMAT, PROFILE_FIELD_ERROR_TYPES } from './utils/constants';
import * as NativeMethods from '../../../utils/native-methods';
import { withBackButtonSupport } from '../../../utils/modal-back-button-support';
import ProfileRewardsImage from '../../../images/profile-rewards.svg';
import PageLoader from '../../../components/PageLoader';
import './Profile.scss';
import CleverTap from '../../../utils/clevertap';

const ERROR_TRANSLATION_KEYS = {
  [PROFILE_FIELD_ERROR_TYPES.REQUIRED]: {
    name: 'NameIsRequired',
    email: 'EmailIsRequired',
    birthday: 'BirthdayIsRequired',
  },
  [PROFILE_FIELD_ERROR_TYPES.UNAVAILABLE]: {
    email: 'NotValidEmail',
    birthday: 'NotValidBirthday',
  },
  [PROFILE_FIELD_ERROR_TYPES.DUPLICATED]: {
    email: 'DuplicatedEmail',
  },
};

const Profile = ({ showProfileModal, closeModal }) => {
  const { t } = useTranslation(['Profile']);
  const birthdayInputRef = useRef(null);
  const dispatch = useDispatch();
  const isProfileVisibility = useSelector(getIsProfileVisibility);
  const isUserProfileStatusPending = useSelector(getIsUserProfileStatusPending);
  const isLaptopSafari = useSelector(getIsLaptopSafari);
  const profileName = useSelector(getProfileName);
  const nameErrorType = useSelector(getNameErrorType);
  const isNameInputErrorDisplay = useSelector(getIsNameInputErrorDisplay);
  const profileEmail = useSelector(getProfileEmail);
  const emailErrorType = useSelector(getEmailErrorType);
  const isEmailInputErrorDisplay = useSelector(getIsEmailInputErrorDisplay);
  const profileBirthday = useSelector(getProfileBirthday);
  const birthdayErrorType = useSelector(getBirthdayErrorType);
  const isBirthdayInputErrorDisplay = useSelector(getIsBirthdayInputErrorDisplay);
  const isDisabledProfileSubmit = useSelector(getIsDisabledProfileSubmit);
  const className = ['profile flex flex-column flex-end aside fixed-wrapper active'];
  const handleSkipProfilePage = useCallback(() => {
    CleverTap.pushEvent('Complete profile page - Click skip for now');
    closeModal();
  }, []);
  const handleChangeName = e => {
    dispatch(profileActions.nameUpdated(e.target.value));
  };
  const handleChangeEmail = e => {
    dispatch(profileActions.emailUpdated(e.target.value));
  };
  const handleSelectBirthDay = e => {
    dispatch(profileActions.birthDayUpdated(e.target.value));
  };
  const handleUpdateProfile = () => {
    dispatch(profileUpdated());
  };

  useEffect(() => {
    if (showProfileModal) {
      dispatch(init());
    }
  }, [dispatch, showProfileModal]);

  if (isUserProfileStatusPending) {
    return (
      <aside className={className.join(' ')}>
        <PageLoader />
      </aside>
    );
  }

  // if (!isProfileVisibility || !showProfileModal) {
  //   return null;
  // }

  // TODO: showProfileModal for aside class name
  // TODO: claimed cashback and login in only display for isProfileVisibility
  return (
    <aside className={className.join(' ')} data-heap-name="ordering.home.profile.container">
      <div className="profile__container flex flex-column flex-space-between aside__content">
        <section>
          <div className="text-right">
            <button
              className="profile__skip-button button button__link flex__shrink-fixed padding-normal text-size-small text-weight-bolder"
              onClick={handleSkipProfilePage}
            >
              {t('SkipForNow')}
            </button>
          </div>
          <h2 className="profile__title margin-top-bottom-small margin-left-right-normal text-size-huge text-weight-bolder">
            {t('CompleteProfile')}
          </h2>
          <div className="profile__tip-container margin-top-bottom-normal margin-left-right-normal flex flex-top padding-small border-radius-large">
            <img
              className="profile__tip-reward-image padding-smaller"
              src={ProfileRewardsImage}
              alt="StoreHub profile rewards"
            />
            <div className="padding-smaller">
              <h4 className="profile__tip-title text-weight-bolder">{t('GetRewarded')}</h4>
              <p className="profile__tip">{t('CompleteProfileTip')}</p>
            </div>
          </div>
          <div className="padding-left-right-normal">
            <div className="margin-top-bottom-normal">
              <div
                className={`profile__form-item form__group padding-small padding-left-right-normal border-radius-large ${
                  isNameInputErrorDisplay ? 'profile__form-item--error' : ''
                }`}
              >
                <label className="profile__label profile__label--required text-size-small text-top">{t('Name')}</label>
                <input
                  name="profileName"
                  value={profileName}
                  className="profile__input form__input"
                  type="text"
                  required={true}
                  onChange={handleChangeName}
                  onFocus={() => {
                    dispatch(profileActions.nameInputCompletedStatusUpdated(false));
                  }}
                  onBlur={() => {
                    dispatch(profileActions.nameInputCompletedStatusUpdated(true));
                  }}
                />
              </div>
              {isNameInputErrorDisplay ? (
                <p className="form__error-message padding-top-bottom-smaller text-size-small">
                  {t(ERROR_TRANSLATION_KEYS[nameErrorType].name)}
                </p>
              ) : null}
            </div>
            <div className="margin-top-bottom-normal">
              <div
                className={`profile__form-item form__group padding-small border-radius-large padding-left-right-normal ${
                  isEmailInputErrorDisplay ? 'profile__form-item--error' : ''
                }`}
              >
                <label className="profile__label profile__label--required text-size-small text-top">{t('Email')}</label>
                <input
                  className="profile__input form__input"
                  name="profileEmail"
                  value={profileEmail}
                  onChange={handleChangeEmail}
                  onFocus={() => {
                    dispatch(profileActions.emailInputCompletedStatusUpdated(false));
                  }}
                  onBlur={() => {
                    dispatch(profileActions.emailInputCompletedStatusUpdated(true));
                  }}
                />
              </div>
              {isEmailInputErrorDisplay ? (
                <p className="form__error-message padding-top-bottom-smaller text-size-small">
                  {t(ERROR_TRANSLATION_KEYS[emailErrorType].email)}
                </p>
              ) : null}
            </div>
            <div className="margin-top-bottom-normal">
              <div
                className={`profile__form-item form__group padding-small padding-left-right-normal border-radius-large ${
                  isBirthdayInputErrorDisplay ? 'profile__form-item--error' : ''
                }`}
              >
                <label className="profile__label profile__label--required text-size-small text-top">
                  {t('DateOfBirth')}
                </label>
                <div className="profile__input-birthday-container">
                  <input
                    ref={birthdayInputRef}
                    className={`profile__input profile__input-birthday form__input ${
                      isLaptopSafari ? 'profile__input-birthday-safari' : ''
                    }`}
                    name="profileBirthday"
                    type="date"
                    onChange={handleSelectBirthDay}
                    onBlur={() => {
                      console.log(111);
                    }}
                  />
                  <input
                    className="profile__input profile__input-birthday-text form__input"
                    name="profileBirthday"
                    value={profileBirthday}
                    placeholder={PROFILE_BIRTHDAY_FORMAT}
                    type="text"
                    onClick={e => {
                      e.stopPropagation();
                      birthdayInputRef.current.showPicker();
                    }}
                    readOnly
                  />
                </div>
              </div>
              {isBirthdayInputErrorDisplay ? (
                <p className="form__error-message padding-top-bottom-smaller text-size-small">
                  {t(ERROR_TRANSLATION_KEYS[birthdayErrorType].birthday)}
                </p>
              ) : null}
            </div>
          </div>
        </section>
        <footer className="footer footer__transparent margin-normal">
          <button
            className="profile__save-button button button__fill button__block padding-small text-weight-bolder text-uppercase"
            disabled={isDisabledProfileSubmit}
            onClick={handleUpdateProfile}
          >
            {t('Save')}
          </button>
        </footer>
      </div>
    </aside>
  );
};

// !name ||
// !birthday ||
// !email ||
// this.props.emailInvalidErrorVisibility ||
// this.props.birthdayInvalidErrorVisibility

// class Profile extends Component {
//   // eslint-disable-next-line react/state-in-constructor
//   state = {
//     nativeMethodExist: true,
//   };

//   async componentDidMount() {
//     this.initCompleteProfileIfNeeded();
//   }

//   componentDidUpdate(prevProps) {
//     // eslint-disable-next-line react/prop-types
//     const { duplicatedEmailAlertVisibility } = this.props;
//     // eslint-disable-next-line react/destructuring-assignment
//     if (this.props.showProfileVisibility !== prevProps.showProfileVisibility) {
//       this.props.onModalVisibilityChanged(this.props.showProfileVisibility);
//       // eslint-disable-next-line react/destructuring-assignment
//       if (Utils.isWebview() && this.props.showProfileVisibility) {
//         this.showNativeCompleteProfilePage();
//       }
//     }

//     // eslint-disable-next-line react/destructuring-assignment
//     if (this.props.user.profile !== prevProps.user.profile) {
//       this.initCompleteProfileIfNeeded();
//     }

//     if (duplicatedEmailAlertVisibility && duplicatedEmailAlertVisibility !== prevProps.duplicatedEmailAlertVisibility) {
//       CleverTap.pushEvent('Complete profile page - Email duplicate pop up');
//     }
//   }

//   initCompleteProfileIfNeeded = () => {
//     const { profileAction } = this.props;

//     const { name, email, birthday, status } = this.props.user.profile || {};

//     if (status === 'fulfilled') {
//       profileAction.init({ name, email, birthday });
//     }
//   };

//   async showNativeCompleteProfilePage() {
//     try {
//       const result = await NativeMethods.showCompleteProfilePageAsync();
//       const { appActions, user } = this.props;
//       const { consumerId } = user || {};
//       if (result?.fulfilled) {
//         appActions.getProfileInfo(consumerId);
//       }
//       this.closeProfileModal();
//     } catch (error) {
//       const nativeMethodNotExist = error.code === NativeMethods.NATIVE_API_ERROR_CODES.METHOD_NOT_EXIST;
//       this.setState({
//         nativeMethodExist: !nativeMethodNotExist,
//       });
//     }
//   }

//   handleClickBack = () => {
//     const { history } = this.props;
//     history.goBack();
//   };

//   saveProfile = async () => {
//     const { saveProfileInfo } = this.props;
//     CleverTap.pushEvent('Complete profile page - Click continue');
//     await saveProfileInfo();
//     if (!this.props.updateProfileError) {
//       this.closeProfileModal();
//     }
//   };

//   closeProfileModal = () => {
//     this.props.closeModal();
//   };

//   onHistoryBackReceived = () => {
//     this.props.closeModal();
//   };

//   handleDoNotAsk = () => {
//     CleverTap.pushEvent("Complete profile page email duplicate pop up - Click don't ask again");
//     Utils.setCookieVariable('do_not_ask', '1', {
//       expires: 3650,
//       path: '/',
//       domain: Utils.getMainDomain(),
//     });

//     this.props.profileAction.doNotAskAgain();
//     this.props.closeModal();
//   };

//   handleBackEdit = () => {
//     CleverTap.pushEvent('Complete profile page email duplicate pop up - Click back to edit');
//     this.props.profileAction.resetUpdateProfileResult();
//   };

//   handleNameInputBlur = () => {
//     this.props.profileAction.completeName();
//   };

//   handleBirthdayInputBlur = () => {
//     this.props.profileAction.completeBirthday();
//   };

//   handleEmailInputBlur = () => {
//     this.props.profileAction.completeEmail();
//   };

//   handleNameInputFocus = () => {
//     this.props.profileAction.startEditName();
//   };

//   handleEmailInputFocus = () => {
//     this.props.profileAction.startEditEmail();
//   };

//   handleBirthdayInputFocus = () => {
//     this.props.profileAction.startEditBirthday();
//   };

//   render() {
//     const {
//       t,
//       showProfileVisibility,
//       duplicatedEmailAlertVisibility,
//       profileEmail: email,
//       profileBirthday: birthday,
//       profileName: name,
//     } = this.props;

//     const className = ['aside fixed-wrapper', 'profile flex flex-column flex-end'];

//     if (Utils.isWebview() && this.state.nativeMethodExist) {
//       return null;
//     }

//     if (showProfileVisibility) {
//       className.push('active cover');
//     }

//     return (
//       <div>
//         <DuplicatedEmailAlert
//           show={duplicatedEmailAlertVisibility}
//           onDoNotAsk={this.handleDoNotAsk}
//           onBackEdit={this.handleBackEdit}
//           t={this.props.t}
//         />
//         <aside className={className.join(' ')} data-heap-name="ordering.home.profile.container">
//           <div className="profile flex flex-column flex-space-between aside__content">
//             <section>
//               <div className="padding-top-bottom-smaller padding-left-right-normal text-right">
//                 <button
//                   className="button button__link text-size-big padding-top-bottom-normal flex__shrink-fixed"
//                   onClick={this.clickSkipForNow}
//                 >
//                   {t('SkipForNow')}
//                 </button>
//               </div>
//               <div className="padding-top-bottom-smaller padding-left-right-normal">
//                 <h2 className="profile__title padding-top-bottom-normal text-size-huge text-weight-bolder">
//                   {t('CompleteProfile')}
//                 </h2>
//                 <p className="profile__tip-color text-size-big text-line-height-base">{t('CompleteProfileTip')}</p>
//               </div>
//               <div className="padding-left-right-normal">
//                 <div className="padding-top-bottom-smaller margin-top-bottom-normal">
//                   <div className="form__group padding-small border-radius-base padding-left-right-normal ">
//                     <div className="profile__label profile__label--required">
//                       <label className="profile__label text-size-small text-top">{t('Name')}</label>
//                     </div>
//                     <input
//                       name="consumerName"
//                       value={name}
//                       className="profile__input form__input"
//                       type="text"
//                       required={true}
//                       onChange={this.handleInputChange}
//                       onFocus={this.handleNameInputFocus}
//                       onBlur={this.handleNameInputBlur}
//                     />
//                   </div>
//                 </div>
//                 <div className="padding-top-bottom-small margin-top-bottom-normal">
//                   <div
//                     className={`form__group padding-small border-radius-base padding-left-right-normal
//                   ${this.props.emailInvalidErrorVisibility ? 'error' : ''}
//                    `}
//                   >
//                     <div className=" profile__label profile__label--required">
//                       <label className="profile__label text-size-small text-top">{t('EmailAddress')}</label>
//                     </div>
//                     <input
//                       name="consumerEmail"
//                       value={email}
//                       onChange={this.handleInputChange}
//                       onBlur={this.handleEmailInputBlur}
//                       className={`profile__input form__input
//                   ${this.props.emailInvalidErrorVisibility ? 'text-error' : ''}
//                    `}
//                       onFocus={this.handleEmailInputFocus}
//                     />
//                   </div>
//                   {this.props.emailInvalidErrorVisibility && (
//                     <p className="profile__input-message--error form__error-message padding-top-bottom-smaller">
//                       {t('NotValidEmail')}
//                     </p>
//                   )}
//                 </div>
//                 <div className="padding-top-bottom-small margin-top-bottom-normal ">
//                   <div
//                     className={`profile__birthday profile__input-next padding-small border-radius-base padding-left-right-normal
//                     ${this.props.birthdayInvalidErrorVisibility ? 'error' : ''}
//                      `}
//                   >
//                     <div className=" profile__label profile__label--required">
//                       <label className="profile__label text-size-small text-top">{t('DateOfBirth')}</label>
//                     </div>
//                     <input
//                       name="consumerBirthday"
//                       value={birthday}
//                       onBlur={this.handleBirthdayInputBlur}
//                       className={`profile__input form__input
//                   ${this.props.birthdayInvalidErrorVisibility ? 'text-error' : ''}
//                    `}
//                       placeholder="DD/MM/YYYY"
//                       type="text"
//                       onChange={this.handleInputChange}
//                       onFocus={this.handleBirthdayInputFocus}
//                     />
//                   </div>
//                   {this.props.birthdayInvalidErrorVisibility && (
//                     <p className="profile__input-message--error form__error-message padding-top-bottom-smaller">
//                       {t('NotValidBirthday')}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </section>
//             <footer className="footer footer__transparent margin-normal">
//               <button
//                 className="button button__fill button__block padding-small text-size-big text-weight-bolder text-uppercase"
//                 disabled={
//                   !name ||
//                   !birthday ||
//                   !email ||
//                   this.props.emailInvalidErrorVisibility ||
//                   this.props.birthdayInvalidErrorVisibility
//                 }
//                 onClick={this.saveProfile}
//               >
//                 {t('Continue')}
//               </button>
//             </footer>
//           </div>
//         </aside>
//       </div>
//     );
//   }
// }
Profile.displayName = 'Profile';

// export default compose(
//   withTranslation('Profile'),
//   connect(
//     state => ({
//       user: getUser(state),
//       profileName: getProfileName(state),
//       profileEmail: getProfileEmail(state),
//       profileBirthday: getProfileBirthday(state),
//       deliveryDetails: getDeliveryDetails(state),
//       updateProfileError: getUpdateProfileError(state),
//       emailInvalidErrorVisibility: getEmailInvalidErrorVisibility(state),
//       // birthdayInvalidErrorVisibility: getBirthdayInvalidErrorVisibility(state),
//       // duplicatedEmailAlertVisibility: getDuplicatedEmailAlertVisibility(state),
//     }),
//     dispatch => ({
//       appActions: bindActionCreators(appActionCreators, dispatch),
//       profileAction: bindActionCreators(profileActionCreators, dispatch),
//       saveProfileInfo: bindActionCreators(saveProfileInfo, dispatch),
//     })
//   ),
//   withBackButtonSupport
// )(Profile);

export default withBackButtonSupport(Profile);
