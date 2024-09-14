import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsDisabledProfileSaveButton, getIsProfileDataUpdating } from '../redux/selectors';
import { profileUpdated, emailUpdated } from '../redux/thunk';
import { alert, toast } from '../../../../common/utils/feedback';
import CleverTap from '../../../../utils/clevertap';

const ProfileFooter = ({ onSave }) => {
  const { t } = useTranslation(['Profile', 'ApiError']);
  const dispatch = useDispatch();
  const isDisabledProfileSaveButton = useSelector(getIsDisabledProfileSaveButton);
  const isProfileDataUpdating = useSelector(getIsProfileDataUpdating);
  const onConfirmDuplicatedEmailNextStep = useCallback(() => {
    alert(t('DuplicatedEmailAlertEmail'), {
      closeButtonContent: t('DuplicatedEmailAlertBackToEdit'),
      title: t('DuplicatedEmailAlertTitle'),
      onClose: () => {
        CleverTap.pushEvent('Complete profile page email duplicate pop up - Click back to edit');
        dispatch(emailUpdated(''));
      },
    });
  }, [dispatch, t]);
  const onSaveButtonClick = useCallback(async () => {
    CleverTap.pushEvent('Complete profile page - Click continue');

    try {
      await dispatch(profileUpdated()).unwrap();

      toast.success(t('SaveSuccess'), { duration: 1000, onClose: onSave });
    } catch (error) {
      if (error?.code === '40024') {
        onConfirmDuplicatedEmailNextStep();
        return;
      }

      // 40002 is common error for verification failed. BE set this code as profile common error
      alert(t('40002Description', { ns: 'ApiError' }), {
        title: t('40002Title', { error_code: '40002', ns: 'ApiError' }),
      });
    }
  }, [dispatch, onConfirmDuplicatedEmailNextStep, onSave, t]);

  return (
    <footer className="footer footer__transparent margin-normal">
      <button
        className="profile__save-button button button__fill button__block padding-small text-weight-bolder text-uppercase"
        data-test-id="ordering.profile.save-btn"
        disabled={isDisabledProfileSaveButton}
        onClick={onSaveButtonClick}
      >
        {isProfileDataUpdating ? t('Processing') : t('Save')}
      </button>
    </footer>
  );
};

ProfileFooter.displayName = 'ProfileFooter';

ProfileFooter.propTypes = {
  onSave: PropTypes.func,
};

ProfileFooter.defaultProps = {
  onSave: () => {},
};

export default ProfileFooter;
