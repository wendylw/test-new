import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  getProfileBirthday,
  getProfileEmail,
  getProfileFirstName,
  getProfileLastName,
  getIsUpdateProfileRequestStatusFulfilled,
  getIsUpdateProfileRequestStatusPending,
} from '../../redux/selectors';
import { actions as completeProfileActions } from '../../redux';
import { saveUserProfileInfo } from '../../redux/thunks';
import InputText from '../../../../../common/components/Input/Text';
import InputEmail from '../../../../../common/components/Input/Email';
import InputBirthday from '../../../../../common/components/Input/Birthday';
import PageFooter from '../../../../../common/components/PageFooter';
import Button from '../../../../../common/components/Button';
import { toast } from '../../../../../common/utils/feedback';
import styles from './CompleteProfileForm.module.scss';

const CompleteProfileForm = ({ disableBirthdayPicker, onClickSkipButton, onClickSaveButton, onClose }) => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const firstName = useSelector(getProfileFirstName);
  const lastName = useSelector(getProfileLastName);
  const email = useSelector(getProfileEmail);
  const birthday = useSelector(getProfileBirthday);
  const isUpdateProfileRequestStatusPending = useSelector(getIsUpdateProfileRequestStatusPending);
  const isUpdateProfileRequestStatusFulfilled = useSelector(getIsUpdateProfileRequestStatusFulfilled);
  const [invalidFields, setInvalidFields] = useState([]);
  const handleValidation = useCallback(
    ({ name, errorMessage }) => {
      if (errorMessage && !invalidFields.includes(name)) {
        setInvalidFields([...invalidFields, name]);
      } else if (!errorMessage && invalidFields.includes(name)) {
        const filteredInvalidFields = invalidFields.filter(invalidField => invalidField !== name);

        setInvalidFields(filteredInvalidFields);
      }
    },
    [invalidFields]
  );
  const handleUpdateFirstName = useCallback(
    targetFirstName => {
      dispatch(completeProfileActions.firstNameUpdated(targetFirstName));
    },
    [dispatch]
  );
  const handleUpdateLastName = useCallback(
    targetLastName => {
      dispatch(completeProfileActions.lastNameUpdated(targetLastName));
    },
    [dispatch]
  );
  const handleUpdateEmail = useCallback(
    targetEmail => {
      dispatch(completeProfileActions.emailUpdated(targetEmail));
    },
    [dispatch]
  );
  const handleUpdateBirthday = useCallback(
    targetBirthday => {
      dispatch(completeProfileActions.birthdayUpdated(targetBirthday));
    },
    [dispatch]
  );
  const handleSkipForm = useCallback(() => {
    onClickSkipButton && onClickSkipButton();
    onClose();
  }, [onClickSkipButton, onClose]);
  const handleSaveForm = useCallback(
    async event => {
      event.preventDefault();

      if (invalidFields.length > 0) {
        return;
      }

      await dispatch(saveUserProfileInfo());

      onClickSaveButton && onClickSaveButton();
      onClose();
    },
    [dispatch, onClickSaveButton, onClose, invalidFields]
  );

  useEffect(() => {
    if (isUpdateProfileRequestStatusFulfilled) {
      toast.success(t('SaveSuccess'));
    }
  }, [isUpdateProfileRequestStatusFulfilled, t]);

  return (
    <form className={styles.CompleteProfileForm} onSubmit={handleSaveForm}>
      <section className={styles.CompleteProfileFieldsSection}>
        <InputText
          data-test-id="profile.complete-form.first-name"
          label={t('FirstName')}
          name="firstName"
          rules={{ required: true }}
          value={firstName}
          onChange={handleUpdateFirstName}
          onBlur={handleUpdateFirstName}
          onValidation={handleValidation}
        />
        <InputText
          data-test-id="profile.complete-form.last-name"
          label={t('LastName')}
          name="lastName"
          value={lastName}
          onChange={handleUpdateLastName}
          onBlur={handleUpdateLastName}
          onValidation={handleValidation}
        />
        <InputEmail
          data-test-id="profile.complete-form.email"
          name="email"
          rules={{ required: true }}
          value={email}
          onChange={handleUpdateEmail}
          onBlur={handleUpdateEmail}
          onValidation={handleValidation}
        />
        <InputBirthday
          data-test-id="profile.complete-form.birthday"
          name="birthday"
          rules={{ required: true }}
          disabled={disableBirthdayPicker}
          value={birthday}
          onChange={handleUpdateBirthday}
          onBlur={handleUpdateBirthday}
          onValidation={handleValidation}
        />
      </section>

      <PageFooter className={styles.CompleteProfileFormPageFooter}>
        <div className={styles.CompleteProfileFormFooter}>
          <Button
            type="secondary"
            className={styles.CompleteProfileFormFooterButton}
            data-test-id="profile.complete-form.skip-for-now-button"
            buttonType="button"
            onClick={handleSkipForm}
          >
            {t('SkipForNow')}
          </Button>
          <Button
            data-test-id="profile.complete-form.save-button"
            className={styles.CompleteProfileFormFooterButton}
            loading={isUpdateProfileRequestStatusPending}
          >
            {t('Save')}
          </Button>
        </div>
      </PageFooter>
    </form>
  );
};

CompleteProfileForm.displayName = 'CompleteProfileForm';

CompleteProfileForm.propTypes = {
  disableBirthdayPicker: PropTypes.bool,
  onClickSkipButton: PropTypes.func,
  onClickSaveButton: PropTypes.func,
  onClose: PropTypes.func,
};

CompleteProfileForm.defaultProps = {
  disableBirthdayPicker: true,
  onClickSkipButton: () => {},
  onClickSaveButton: () => {},
  onClose: () => {},
};

export default CompleteProfileForm;
