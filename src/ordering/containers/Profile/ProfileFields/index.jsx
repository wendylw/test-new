import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  getNameErrorType,
  getIsNameInputErrorDisplay,
  getEmailErrorType,
  getIsEmailInputErrorDisplay,
  getBirthdayErrorType,
  getIsBirthdayInputErrorDisplay,
  getProfileName,
  getProfileEmail,
  getProfileBirthday,
} from '../redux/selectors';
import { nameUpdated, emailUpdated, birthdaySelected, birthdayUpdated } from '../redux/thunk';
import { actions as profileActions } from '../redux';
import { isSafari, isTNGMiniProgram } from '../../../../common/utils';
import { isSupportedShowPicker } from '../utils';
import { PROFILE_BIRTHDAY_FORMAT, ERROR_TRANSLATION_KEYS, BIRTHDAY_DATE } from '../utils/constants';

const ProfileFields = () => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const emailInputRef = useRef(null);
  const birthdayInputRef = useRef(null);
  const profileName = useSelector(getProfileName);
  const profileEmail = useSelector(getProfileEmail);
  const profileBirthday = useSelector(getProfileBirthday);
  const nameErrorType = useSelector(getNameErrorType);
  const isNameInputErrorDisplay = useSelector(getIsNameInputErrorDisplay);
  const emailErrorType = useSelector(getEmailErrorType);
  const isEmailInputErrorDisplay = useSelector(getIsEmailInputErrorDisplay);
  const birthdayErrorType = useSelector(getBirthdayErrorType);
  const isBirthdayInputErrorDisplay = useSelector(getIsBirthdayInputErrorDisplay);
  const handleChangeName = e => {
    dispatch(nameUpdated(e.target.value));
  };
  const handleChangeEmail = e => {
    dispatch(emailUpdated(e.target.value));
  };
  const handleSelectBirthDay = e => {
    dispatch(birthdaySelected(e.target.value));
    dispatch(profileActions.birthdayInputFilledStatusUpdated(true));
  };
  const handleFocusNameInput = useCallback(() => {
    dispatch(profileActions.nameInputFilledStatusUpdated(false));
  }, [dispatch]);
  const handleBlurNameInput = () => {
    dispatch(profileActions.nameInputFilledStatusUpdated(true));
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
            isNameInputErrorDisplay ? 'profile__form-item--error' : ''
          }`}
        >
          <label htmlFor={profileName} className="profile__label profile__label--required text-size-small text-top">
            {t('Name')}
          </label>
          <input
            className="profile__input form__input"
            name="profileName"
            type="text"
            required
            value={profileName}
            onChange={handleChangeName}
            onFocus={handleFocusNameInput}
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
              {isSupportedShowPicker() ? (
                <>
                  <input
                    ref={birthdayInputRef}
                    // If browser is desktop Safari, showPicker() can not be execute
                    // Customer clicked input text to show date picker, so need to up date z-index can be touch on layout top
                    // For date input can be click in Safari
                    className={`profile__input profile__input-birthday form__input ${
                      isSafari() ? 'profile__input-birthday-safari' : ''
                    }`}
                    name="profileBirthday"
                    type="date"
                    min={BIRTHDAY_DATE.MIN}
                    max={BIRTHDAY_DATE.MAX}
                    onChange={handleSelectBirthDay}
                    onClick={e => {
                      console.log(isSupportedShowPicker());
                      console.log(birthdayInputRef.current.showPicker);
                      console.log(navigator.userAgent);
                      // TNG MiniProgram browser is not support date-picker display automatically
                      if (isTNGMiniProgram()) {
                        e.stopPropagation();
                        // only input date supported will call showPicker
                        birthdayInputRef.current.showPicker();
                      }
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
                      // only input date supported will call showPicker
                      birthdayInputRef.current.showPicker();
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
