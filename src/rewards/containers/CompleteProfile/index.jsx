import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { isWebview } from '../../../common/utils';
import CleverTap from '../../../utils/clevertap';
import { getUploadProfileError, getIsUploadProfileEmailDuplicateError } from '../../../redux/modules/user/selectors';
import {
  getIsUpdateBirthdayRequestShow,
  getIsProfileRequestMountStatusPending,
  getIsUpdateProfileRequestStatusPending,
  getIsUpdateBirthdayRequestCompleted,
} from './redux/selectors';
import { actions as completeProfileActions } from './redux';
import { mount } from './redux/thunks';
import Drawer from '../../../common/components/Drawer';
import PageToast from '../../../common/components/PageToast';
import Loader from '../../../common/components/Loader';
import { alert } from '../../../common/utils/feedback';
import SkeletonLoader from './components/SkeletonLoader';
import CompleteUserProfile from './CompleteUserProfile';
import CompleteBirthday from './CompleteBirthday';
import styles from './CompleteProfile.module.scss';

const CompleteProfile = ({ show, isCompleteBirthdayFirst, onSkip, onSave, onClose }) => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const uploadProfileError = useSelector(getUploadProfileError);
  const isUploadProfileEmailDuplicateError = useSelector(getIsUploadProfileEmailDuplicateError);
  const isUpdateBirthdayRequestShow = useSelector(getIsUpdateBirthdayRequestShow);
  const isProfileRequestStatusPending = useSelector(getIsProfileRequestMountStatusPending);
  const isUpdateProfileRequestStatusPending = useSelector(getIsUpdateProfileRequestStatusPending);
  const isUpdateBirthdayRequestCompleted = useSelector(getIsUpdateBirthdayRequestCompleted);
  const isBirthdayPickerShow = !(isCompleteBirthdayFirst && isUpdateBirthdayRequestCompleted);

  useEffect(() => {
    if (show) {
      dispatch(mount(isCompleteBirthdayFirst));
    } else {
      dispatch(completeProfileActions.stateReset());
    }
  }, [show, isCompleteBirthdayFirst, dispatch]);

  useEffect(() => {
    if (uploadProfileError && isUploadProfileEmailDuplicateError) {
      alert(t('DuplicatedEmailAlertEmail'), {
        closeButtonContent: t('DuplicatedEmailAlertBackToEdit'),
        title: t('DuplicatedEmailAlertTitle'),
        onClose: () => {
          CleverTap.pushEvent('Complete profile page email duplicate pop up - Click back to edit');
          dispatch(completeProfileActions.birthdayUpdated(''));
        },
      });
    } else if (uploadProfileError) {
      alert(t('40002Description', { ns: 'ApiError' }), {
        title: t('ApiError:40002Title', { error_code: '40002', ns: 'ApiError' }),
      });
    }
  }, [uploadProfileError, isUploadProfileEmailDuplicateError, t, dispatch]);

  if (isWebview()) {
    return null;
  }

  return (
    <Drawer
      className={styles.CompleteProfileDrawer}
      childrenClassName={styles.CompleteProfileDrawerContent}
      fullScreen
      show={show}
      onClose={onClose}
    >
      {isProfileRequestStatusPending ? (
        <SkeletonLoader />
      ) : isUpdateBirthdayRequestShow ? (
        <CompleteBirthday onSkip={onSkip} onSave={onSave} />
      ) : (
        <CompleteUserProfile
          showBirthdayPicker={isBirthdayPickerShow}
          onSkip={onSkip}
          onSave={onSave}
          onClose={onClose}
        />
      )}
      {isUpdateProfileRequestStatusPending && (
        <PageToast icon={<Loader className="tw-m-8 sm:tw-m-8px" size={30} />}>{`${t('Processing')}...`}</PageToast>
      )}
    </Drawer>
  );
};

CompleteProfile.displayName = 'CompleteProfile';

CompleteProfile.propTypes = {
  show: PropTypes.bool,
  isCompleteBirthdayFirst: PropTypes.bool,
  onSkip: PropTypes.func,
  onSave: PropTypes.func,
  onClose: PropTypes.func,
};

CompleteProfile.defaultProps = {
  show: false,
  isCompleteBirthdayFirst: false,
  onSkip: () => {},
  onSave: () => {},
  onClose: () => {},
};

export default CompleteProfile;
