import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  getIsFirstNameInputErrorDisplay,
  getEmailErrorType,
  getIsEmailInputErrorDisplay,
  getBirthdayErrorType,
  getIsBirthdayInputErrorDisplay,
  getProfileFirstName,
  getProfileLastName,
  getProfileEmail,
  getProfileBirthday,
} from '../redux/selectors';
import { firstNameUpdated, lastNameUpdated, emailUpdated, birthdaySelected, birthdayUpdated } from '../redux/thunk';
import { actions as profileActions } from '../redux';
import { getIsSupportedShowPicker, getIsDateInputOnUpperLayer } from '../utils';
import {
  PROFILE_BIRTHDAY_FORMAT,
  ERROR_TRANSLATION_KEYS,
  BIRTHDAY_DATE,
  PROFILE_FIELD_ERROR_TYPES,
} from '../utils/constants';
import logger from '../../../../utils/monitoring/logger';

const ProfileFields = () => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const emailInputRef = useRef(null);
  const birthdayInputRef = useRef(null);
  const profileFirstName = useSelector(getProfileFirstName);
  const profileLastName = useSelector(getProfileLastName);
  const profileEmail = useSelector(getProfileEmail);
  const profileBirthday = useSelector(getProfileBirthday);
  const isFirstNameInputErrorDisplay = useSelector(getIsFirstNameInputErrorDisplay);
  const emailErrorType = useSelector(getEmailErrorType);
  const isEmailInputErrorDisplay = useSelector(getIsEmailInputErrorDisplay);
  const birthdayErrorType = useSelector(getBirthdayErrorType);
  const isBirthdayInputErrorDisplay = useSelector(getIsBirthdayInputErrorDisplay);
  const handleChangeFirstName = e => {
    dispatch(firstNameUpdated(e.target.value));
  };
  const handleChangeLastName = e => {
    dispatch(lastNameUpdated(e.target.value));
  };
  const handleChangeEmail = e => {
    dispatch(emailUpdated(e.target.value));
  };
  const handleSelectBirthDay = e => {
    dispatch(birthdaySelected(e.target.value));
  };
  const handleFocusFirstNameInput = useCallback(() => {
    dispatch(profileActions.firstNameInputFilledStatusUpdated(false));
  }, [dispatch]);
  const handleBlurFirstNameInput = () => {
    dispatch(profileActions.firstNameInputFilledStatusUpdated(true));
  };
  const handleFocusEmailInput = useCallback(() => {
    dispatch(profileActions.emailInputFilledStatusUpdated(false));
  }, [dispatch]);
  const handleBlurEmailInput = () => {
    dispatch(profileActions.emailInputFilledStatusUpdated(true));
  };
  // Birthday Input call change, focus & blur, when browser unsupported showPicker
  const handleChangeBirthDay = e => {
    dispatch(birthdayUpdated(e.target.value));
  };
  const handleFocusBirthdayInput = useCallback(() => {
    dispatch(profileActions.birthdayInputFilledStatusUpdated(false));
  }, [dispatch]);
  const handleBlurBirthdayInput = () => {
    dispatch(profileActions.birthdayInputFilledStatusUpdated(true));
  };

  return (
    <>
      <div className="margin-top-bottom-normal">
        <div
          className={`profile__form-item form__group padding-small padding-left-right-normal border-radius-large ${
            isFirstNameInputErrorDisplay ? 'profile__form-item--error' : ''
          }`}
        >
          <label
            htmlFor={profileFirstName}
            className="profile__label profile__label--required text-size-small text-top"
          >
            {t('FirstName')}
          </label>
          <input
            className="profile__input form__input"
            name="profileFirstName"
            type="text"
            required
            value={profileFirstName}
            data-test-id="ordering.profile.name-input"
            onChange={handleChangeFirstName}
            onFocus={handleFocusFirstNameInput}
            onBlur={handleBlurFirstNameInput}
          />
        </div>
        {isFirstNameInputErrorDisplay ? (
          <p className="form__error-message padding-top-bottom-smaller text-size-small">
            {t(ERROR_TRANSLATION_KEYS[PROFILE_FIELD_ERROR_TYPES.REQUIRED].name)}
          </p>
        ) : null}
      </div>

      <div className="margin-top-bottom-normal">
        <div className="profile__form-item form__group padding-small padding-left-right-normal border-radius-large">
          <label htmlFor={profileLastName} className="profile__label text-size-small text-top">
            {t('LastName')}
          </label>
          <input
            className="profile__input form__input"
            name="profileLastName"
            type="text"
            value={profileLastName}
            data-test-id="ordering.profile.name-input"
            onChange={handleChangeLastName}
          />
        </div>
      </div>

      <div className="margin-top-bottom-normal">
        <div
          className={`profile__form-item form__group padding-small border-radius-large padding-left-right-normal ${
            isEmailInputErrorDisplay ? 'profile__form-item--error' : ''
          }`}
        >
          <label htmlFor={profileEmail} className="profile__label profile__label--required text-size-small text-top">
            {t('Email')}
          </label>
          <input
            ref={emailInputRef}
            className="profile__input form__input"
            name="profileEmail"
            type="email"
            required
            value={profileEmail}
            data-test-id="ordering.profile.email-input"
            onChange={handleChangeEmail}
            onFocus={handleFocusEmailInput}
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
          <label htmlFor={profileBirthday} className="profile__label profile__label--required text-size-small text-top">
            {t('DateOfBirth')}
          </label>
          <div className="profile__input-birthday-container">
            <div>
              {/* If show picker unsupported, date input is removed, let customer can fill date by text input */}
              {getIsSupportedShowPicker() ? (
                <>
                  <input
                    ref={birthdayInputRef}
                    // Customer clicked input text to show date picker, so need to up date z-index can be touch on layout top
                    className={`profile__input profile__input-birthday form__input ${
                      getIsDateInputOnUpperLayer() ? 'profile__upper-layer' : ''
                    }`}
                    name="profileBirthday"
                    type="date"
                    min={BIRTHDAY_DATE.MIN}
                    max={BIRTHDAY_DATE.MAX}
                    data-test-id="ordering.profile.birthday-input"
                    onChange={handleSelectBirthDay}
                  />
                  {/* Reference input text is for most can */}
                  <input
                    className="profile__input profile__input-birthday-text form__input"
                    name="profileBirthday"
                    value={profileBirthday}
                    placeholder={PROFILE_BIRTHDAY_FORMAT}
                    type="text"
                    data-test-id="ordering.profile.birthday-picker"
                    onClick={e => {
                      try {
                        e.stopPropagation();
                        // only input date supported will call showPicker
                        birthdayInputRef.current.showPicker();
                      } catch (error) {
                        // TODO: two weeks will be removed, want to collect that how much browser unsupported via Sentry
                        console.error(e?.message);

                        logger.error('Common_InputBirthDay_ShowPickerFailed', { message: e?.message });
                      }
                    }}
                    readOnly
                  />
                </>
              ) : (
                <input
                  className="profile__input form__input"
                  name="profileBirthday"
                  value={profileBirthday}
                  placeholder={PROFILE_BIRTHDAY_FORMAT}
                  type="text"
                  data-test-id="ordering.profile.birthday-input"
                  onChange={handleChangeBirthDay}
                  onFocus={handleFocusBirthdayInput}
                  onBlur={handleBlurBirthdayInput}
                />
              )}
            </div>
          </div>
        </div>
        {isBirthdayInputErrorDisplay ? (
          <p className="form__error-message padding-top-bottom-smaller text-size-small">
            {t(ERROR_TRANSLATION_KEYS[birthdayErrorType].birthday)}
          </p>
        ) : null}
      </div>
    </>
  );
};

ProfileFields.displayName = 'ProfileFields';

export default ProfileFields;
