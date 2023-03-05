import _trim from 'lodash/trim';
import dayjs from 'dayjs';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { getIsUserProfileStatusPending } from '../../redux/modules/app';
import {
  getNameErrorType,
  getIsNameInputErrorDisplay,
  getEmailErrorType,
  getIsEmailInputErrorDisplay,
  getBirthdayErrorType,
  getIsBirthdayInputErrorDisplay,
  getIsDisabledProfileSaveButton,
  getIsProfileDataUpdating,
  getProfileName,
  getProfileEmail,
  getProfileBirthday,
} from './redux/selectors';
import {
  profileUpdated,
  profileMissingSkippedLimitUpdated,
  init,
  nameUpdated,
  emailUpdated,
  birthdayUpdated,
} from './redux/thunk';
import { actions as profileActions } from './redux';
import { confirm, toast } from '../../../common/utils/feedback';
import { isSafari } from '../../../common/utils';
import { PROFILE_BIRTHDAY_FORMAT, ERROR_TRANSLATION_KEYS, BIRTHDAY_DATE } from './utils/constants';
import { useBackButtonSupport } from '../../../utils/modal-back-button-support';
import ProfileRewardsImage from '../../../images/profile-rewards.svg';
import PageLoader from '../../../components/PageLoader';
import CleverTap from '../../../utils/clevertap';
import './Profile.scss';
import logger from '../../../utils/monitoring/logger';

const Profile = ({ show, onClose }) => {
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
  const isUserProfileStatusPending = useSelector(getIsUserProfileStatusPending);
  const isDisabledProfileSaveButton = useSelector(getIsDisabledProfileSaveButton);
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

  const handleChangeName = e => {
    dispatch(nameUpdated(e.target.value));
  };
  const handleChangeEmail = e => {
    dispatch(emailUpdated(e.target.value));
  };
  const handleSelectBirthDay = e => {
    const selectedBirthday = dayjs(_trim(e.target.value)).format(PROFILE_BIRTHDAY_FORMAT);

    birthdayUpdated(selectedBirthday);
    dispatch(profileActions.birthdaySelectorCompletedStatusUpdated(true));
  };
  const handleFocusNameInput = useCallback(() => {
    dispatch(profileActions.nameInputCompletedStatusUpdated(false));
  }, [dispatch]);
  const handleBlurNameInput = () => {
    dispatch(profileActions.nameInputCompletedStatusUpdated(true));
  };
  const handleFocusEmailInput = useCallback(() => {
    dispatch(profileActions.emailInputCompletedStatusUpdated(false));
  }, [dispatch]);
  const handleBlurEmailInput = () => {
    dispatch(profileActions.emailInputCompletedStatusUpdated(true));
  };
  const onSkipProfilePage = useCallback(() => {
    CleverTap.pushEvent('Complete profile page - Click skip for now');
    onClose();
  }, [onClose]);
  const onConfirmDuplicatedEmailNextStep = useCallback(() => {
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
          emailUpdated('');
          emailInputRef.current.focus();
        } else {
          CleverTap.pushEvent("Complete profile page email duplicate pop up - Click don't ask again");
          dispatch(profileMissingSkippedLimitUpdated());
          onClose();
        }
      },
    });
  }, [dispatch, onClose, t]);
  const onSaveButtonClick = async () => {
    CleverTap.pushEvent('Complete profile page - Click continue');

    try {
      const result = await dispatch(profileUpdated());

      if (!result.error) {
        toast.success(t('SaveSuccess'));
      }

      if (result.error?.code === '40024') {
        onConfirmDuplicatedEmailNextStep();
      } else {
        // 40002 is common error for verification failed. BE set this code as profile common error
        alert(t('ApiError:40002Description'), { title: 'ApiError:40002Title' });
      }
    } catch (error) {
      logger.error('Ordering_OrderStatus_ProfileUpdatedFailed', { message: error?.message });
    }
  };

  useMount(() => {
    dispatch(init());
  });

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
              <div className="padding-left-right-normal">
                <div className="margin-top-bottom-normal">
                  <div
                    className={`profile__form-item form__group padding-small padding-left-right-normal border-radius-large ${
                      isNameInputErrorDisplay ? 'profile__form-item--error' : ''
                    }`}
                  >
                    <label className="profile__label profile__label--required text-size-small text-top">
                      {t('Name')}
                    </label>
                    <input
                      className="profile__input form__input"
                      name="profileName"
                      type="text"
                      required={true}
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
                    <label className="profile__label profile__label--required text-size-small text-top">
                      {t('Email')}
                    </label>
                    <input
                      ref={emailInputRef}
                      className="profile__input form__input"
                      name="profileEmail"
                      type="email"
                      required={true}
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
                    <label className="profile__label profile__label--required text-size-small text-top">
                      {t('DateOfBirth')}
                    </label>
                    <div className="profile__input-birthday-container">
                      <div>
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
