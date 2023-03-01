import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsUserProfileStatusPending } from '../../redux/modules/app';
import {
  getIsProfileWebVisibility,
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
  getIsValidProfileForm,
} from './redux/selectors';
import { init, profileUpdated, profileMissingSkippedLimitUpdated } from './redux/thunk';
import { actions as profileActions } from './redux';
import { confirm, toast } from '../../../common/utils/feedback';
import { PROFILE_BIRTHDAY_FORMAT, PROFILE_FIELD_ERROR_TYPES } from './utils/constants';
import { withBackButtonSupport } from '../../../utils/modal-back-button-support';
import ProfileRewardsImage from '../../../images/profile-rewards.svg';
import PageLoader from '../../../components/PageLoader';
import CleverTap from '../../../utils/clevertap';
import './Profile.scss';
import logger from '../../../utils/monitoring/logger';

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
  const isProfileWebVisibility = useSelector(getIsProfileWebVisibility);
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
  const isValidProfileForm = useSelector(getIsValidProfileForm);
  const className = ['profile flex flex-column flex-end aside fixed-wrapper'];
  const handleSkipProfilePage = useCallback(() => {
    CleverTap.pushEvent('Complete profile page - Click skip for now');
    closeModal();
  }, [closeModal]);
  const handleChangeName = e => {
    dispatch(profileActions.nameUpdated(e.target.value));
  };
  const handleChangeEmail = e => {
    dispatch(profileActions.emailUpdated(e.target.value));
  };
  const handleSelectBirthDay = e => {
    dispatch(profileActions.birthDayUpdated(e.target.value));
  };
  const handleUpdateProfile = async () => {
    CleverTap.pushEvent('Complete profile page - Click continue');

    if (!isValidProfileForm) {
      return;
    }

    try {
      const result = await dispatch(profileUpdated());

      if (result.error && result.error?.code === '40024') {
        confirm(t('DuplicatedEmailAlertEmail'), {
          className: 'profile__email-duplicated-confirm',
          closeByBackButton: false,
          closeByBackDrop: false,
          cancelButtonContent: t('DuplicatedEmailAlertDoNotAskAgain'),
          confirmButtonContent: t('DuplicatedEmailAlertBackToEdit'),
          title: t('DuplicatedEmailAlertTitle'),
          onSelection: async status => {
            if (status) {
              CleverTap.pushEvent('Complete profile page email duplicate pop up - Click back to edit');
              dispatch(profileActions.emailUpdated(''));
            } else {
              CleverTap.pushEvent("Complete profile page email duplicate pop up - Click don't ask again");
              dispatch(profileMissingSkippedLimitUpdated());
              closeModal();
            }
          },
        });

        return;
      }

      toast.success(t('SaveSuccess'));
    } catch (error) {
      logger.error('Ordering_OrderStatus_ProfileUpdatedFailed', { message: error?.message });
    }
  };

  useEffect(() => {
    if (showProfileModal) {
      dispatch(init());
    }
  }, [dispatch, showProfileModal]);

  if (isUserProfileStatusPending && showProfileModal) {
    return (
      <aside className={className.join(' ')}>
        <PageLoader />
      </aside>
    );
  }

  if (!isProfileWebVisibility || !showProfileModal) {
    return null;
  }

  if (showProfileModal) {
    className.push('active');
  }

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
                    min="1900-01-01"
                    onChange={handleSelectBirthDay}
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

Profile.displayName = 'Profile';

export default withBackButtonSupport(Profile);
