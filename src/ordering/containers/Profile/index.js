import _trim from 'lodash/trim';
import dayjs from 'dayjs';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsUserProfileStatusPending, getUserProfile } from '../../redux/modules/app';
import {
  getNameErrorType,
  getIsNameInputErrorDisplay,
  getEmailErrorType,
  getIsEmailInputErrorDisplay,
  getBirthdayErrorType,
  getIsBirthdayInputErrorDisplay,
  getIsSafari,
  getIsDisabledProfileSaveButton,
  getIsValidProfileForm,
  getIsProfileDataUpdating,
} from './redux/selectors';
import {
  profileUpdated,
  profileMissingSkippedLimitUpdated,
  validateName,
  validateEmail,
  validateBirthday,
} from './redux/thunk';
import { actions as profileActions } from './redux';
import { confirm, toast } from '../../../common/utils/feedback';
import { PROFILE_BIRTHDAY_FORMAT, ERROR_TRANSLATION_KEYS, BIRTHDAY_DATE } from './utils/constants';
import { useBackButtonSupport } from '../../../utils/modal-back-button-support';
import ProfileRewardsImage from '../../../images/profile-rewards.svg';
import PageLoader from '../../../components/PageLoader';
import CleverTap from '../../../utils/clevertap';
import './Profile.scss';
import logger from '../../../utils/monitoring/logger';

const ProfileFields = ({
  profileName,
  profileEmail,
  profileBirthday,
  onUpdateName,
  onUpdateEmail,
  onUpdateBirthday,
}) => {
  const { t } = useTranslation(['Profile']);
  const birthdayInputRef = useRef(null);
  const dispatch = useDispatch();
  const isSafari = useSelector(getIsSafari);
  const nameErrorType = useSelector(getNameErrorType);
  const isNameInputErrorDisplay = useSelector(getIsNameInputErrorDisplay);
  const emailErrorType = useSelector(getEmailErrorType);
  const isEmailInputErrorDisplay = useSelector(getIsEmailInputErrorDisplay);
  const birthdayErrorType = useSelector(getBirthdayErrorType);
  const isBirthdayInputErrorDisplay = useSelector(getIsBirthdayInputErrorDisplay);
  const handleChangeName = e => {
    const newName = e.target.value;

    dispatch(profileActions.nameInputCompletedStatusUpdated(false));
    onUpdateName(newName);
    validateName(newName);
  };
  const handleChangeEmail = e => {
    const newEmail = _trim(e.target.value);

    dispatch(profileActions.emailInputCompletedStatusUpdated(false));
    onUpdateEmail(newEmail);
    validateEmail(newEmail);
  };
  const handleSelectBirthDay = e => {
    const selectedBirthday = dayjs(_trim(e.target.value)).format(PROFILE_BIRTHDAY_FORMAT);

    dispatch(profileActions.birthdaySelectorCompletedStatusUpdated(true));
    onUpdateBirthday(selectedBirthday);
    validateBirthday(selectedBirthday);
  };
  const handleBlurNameInput = useCallback(() => {
    dispatch(profileActions.nameInputCompletedStatusUpdated(true));
  }, [dispatch]);
  const handleBlurEmailInput = useCallback(() => {
    dispatch(profileActions.emailInputCompletedStatusUpdated(true));
  }, [dispatch]);

  return (
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
            onBlur={handleBlurNameInput}
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
            onBlur={handleBlurEmailInput}
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
          <label className="profile__label profile__label--required text-size-small text-top">{t('DateOfBirth')}</label>
          <div className="profile__input-birthday-container">
            <div>
              <input
                ref={birthdayInputRef}
                // If browser is desktop Safari, showPicker() can not be execute
                // Customer clicked input text to show date picker, so need to up date z-index can be touch on layout top
                className={`profile__input profile__input-birthday form__input ${
                  isSafari ? 'profile__input-birthday-safari' : ''
                }`}
                name="profileBirthday"
                type="date"
                min={BIRTHDAY_DATE.MIN}
                max={BIRTHDAY_DATE.MAX}
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
        </div>
        {isBirthdayInputErrorDisplay ? (
          <p className="form__error-message padding-top-bottom-smaller text-size-small">
            {t(ERROR_TRANSLATION_KEYS[birthdayErrorType].birthday)}
          </p>
        ) : null}
      </div>
    </div>
  );
};

ProfileFields.displayName = 'ProfileFields';

const Profile = ({ show, onClose }) => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const { name, email, birthday } = useSelector(getUserProfile) || {};
  const isUserProfileStatusPending = useSelector(getIsUserProfileStatusPending);
  const isDisabledProfileSaveButton = useSelector(getIsDisabledProfileSaveButton);
  const isValidProfileForm = useSelector(getIsValidProfileForm);
  const isProfileDataUpdating = useSelector(getIsProfileDataUpdating);
  const className = ['profile flex flex-column flex-end aside fixed-wrapper'];
  const onHistoryBackReceived = useCallback(() => {
    onClose();
    return true;
  }, [onClose]);

  useBackButtonSupport({
    visibility: show,
    onHistoryBackReceived,
  });

  const onSkipProfilePage = useCallback(() => {
    CleverTap.pushEvent('Complete profile page - Click skip for now');
    onClose();
  }, [onClose]);
  const [profileName, setProfileName] = useState(name);
  const [profileEmail, setProfileEmail] = useState(_trim(email));
  const [profileBirthday, setProfileBirthday] = useState(_trim(birthday));
  const onSaveButtonClick = async () => {
    CleverTap.pushEvent('Complete profile page - Click continue');

    if (!isValidProfileForm) {
      return;
    }

    try {
      const result = await dispatch(
        profileUpdated({ firstName: profileName, email: profileEmail, birthday: profileBirthday })
      );

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
              onClose();
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

  if (show) {
    className.push('active');
  }

  return (
    <aside className={className.join(' ')} data-heap-name="ordering.home.profile.container">
      <div className="profile__container flex flex-column flex-space-between aside__content">
        {isUserProfileStatusPending && show ? (
          <PageLoader />
        ) : (
          <>
            <section>
              <div className="text-right">
                <button
                  className="profile__skip-button button button__link flex__shrink-fixed padding-normal text-size-small text-weight-bolder"
                  onClick={onSkipProfilePage}
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
              <ProfileFields
                name={profileName}
                email={profileEmail}
                birthday={profileBirthday}
                onUpdateName={setProfileName}
                onUpdateEmail={setProfileEmail}
                onUpdateBirthday={setProfileBirthday}
              />
            </section>
            <footer className="footer footer__transparent margin-normal">
              <button
                className="profile__save-button button button__fill button__block padding-small text-weight-bolder text-uppercase"
                disabled={isDisabledProfileSaveButton}
                onClick={onSaveButtonClick}
              >
                {isProfileDataUpdating ? t('Processing') : t('Save')}
              </button>
            </footer>
          </>
        )}
      </div>
    </aside>
  );
};

Profile.displayName = 'Profile';

export default Profile;
