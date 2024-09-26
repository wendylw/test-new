import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getProfileBirthday, getIsUpdateBirthdayRequestPending } from '../../redux/selectors';
import { actions as profileActions } from '../../redux';
import { hideUpdateBirthdayForm, saveBirthdayInfo } from '../../redux/thunks';
import InputBirthday from '../../../../../common/components/Input/Birthday';
import PageFooter from '../../../../../common/components/PageFooter';
import Button from '../../../../../common/components/Button';
import styles from './CompleteBirthdayForm.module.scss';

const CompleteBirthdayForm = ({ onClickSkipButton, onClickSaveButton }) => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const birthday = useSelector(getProfileBirthday);
  const isUpdateBirthdayRequestPending = useSelector(getIsUpdateBirthdayRequestPending);
  const [invalidBirthday, setInvalidBirthday] = useState(false);
  const handleValidation = useCallback(({ errorMessage }) => setInvalidBirthday(!!errorMessage), []);
  const handleUpdateBirthday = useCallback(
    targetBirthday => {
      dispatch(profileActions.birthdayUpdated(targetBirthday));
    },
    [dispatch]
  );
  const handleSkipForm = useCallback(() => {
    dispatch(hideUpdateBirthdayForm());
    onClickSkipButton && onClickSkipButton();
  }, [dispatch, onClickSkipButton]);
  const handleSaveForm = useCallback(
    async event => {
      event.preventDefault();

      if (invalidBirthday) {
        return;
      }

      await dispatch(saveBirthdayInfo());
      onClickSaveButton();
    },
    [dispatch, onClickSaveButton, invalidBirthday]
  );

  return (
    <form className={styles.CompleteBirthdayForm} onSubmit={handleSaveForm}>
      <section className={styles.CompleteProfileFieldsSection}>
        <InputBirthday
          data-test-id="profile.birthday-form.birthday"
          name="birthday"
          rules={{ required: true }}
          value={birthday}
          onChange={handleUpdateBirthday}
          onBlur={handleUpdateBirthday}
          onValidation={handleValidation}
        />
      </section>

      <PageFooter>
        <div className={styles.CompleteBirthdayFormFooter}>
          <Button
            type="secondary"
            className={styles.CompleteBirthdayFormFooterButton}
            data-test-id="profile.birthday-form.skip-for-now-button"
            buttonType="button"
            onClick={handleSkipForm}
          >
            {t('SkipForNow')}
          </Button>
          <Button
            data-test-id="profile.birthday-form.save-button"
            className={styles.CompleteBirthdayFormFooterButton}
            loading={isUpdateBirthdayRequestPending}
          >
            {t('Save')}
          </Button>
        </div>
      </PageFooter>
    </form>
  );
};

CompleteBirthdayForm.displayName = 'CompleteBirthdayForm';

CompleteBirthdayForm.propTypes = {
  onClickSkipButton: PropTypes.func,
  onClickSaveButton: PropTypes.func,
};

CompleteBirthdayForm.defaultProps = {
  onClickSkipButton: () => {},
  onClickSaveButton: () => {},
};

export default CompleteBirthdayForm;
