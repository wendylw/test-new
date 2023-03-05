import React, { useCallback } from 'react';
import { func } from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsDisabledProfileSaveButton, getIsProfileDataUpdating } from '../redux/selectors';
import { profileUpdated, profileMissingSkippedLimitUpdated, emailUpdated } from '../redux/thunk';
import { alert, confirm, toast } from '../../../../common/utils/feedback';
import CleverTap from '../../../../utils/clevertap';
import logger from '../../../../utils/monitoring/logger';

const ProfileFooter = ({ onCloseProfile }) => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const isDisabledProfileSaveButton = useSelector(getIsDisabledProfileSaveButton);
  const isProfileDataUpdating = useSelector(getIsProfileDataUpdating);
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
          dispatch(emailUpdated(''));
        } else {
          CleverTap.pushEvent("Complete profile page email duplicate pop up - Click don't ask again");
          dispatch(profileMissingSkippedLimitUpdated());
          onCloseProfile();
        }
      },
    });
  }, [dispatch, onCloseProfile, t]);
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
        alert(t('ApiError:40002Description'), { title: t('ApiError:40002Title', { error_code: '40002' }) });
      }
    } catch (error) {
      logger.error('Ordering_OrderStatus_ProfileUpdatedFailed', { message: error?.message });
    }
  };

  return (
    <footer className="footer footer__transparent margin-normal">
      <button
        className="profile__save-button button button__fill button__block padding-small text-weight-bolder text-uppercase"
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
  onCloseProfile: func,
};

ProfileFooter.defaultProps = {
  onCloseProfile: () => {},
};

export default ProfileFooter;
