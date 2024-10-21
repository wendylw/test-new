import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import CompleteProfileImage from '../../../images/complete-profile.svg';
import HeroSection from './components/HeroSection';
import CompleteProfileForm from './components/CompleteProfileForm';
import styles from './CompleteUserProfile.module.scss';

const CompleteUserProfile = ({ disableBirthdayPicker, onSkip, onSave, onClose }) => {
  const { t } = useTranslation();

  return (
    <>
      <HeroSection
        title={t('CompleteProfileTile')}
        image={CompleteProfileImage}
        description={<p className={styles.CompleteUserProfileDescription}>{t('CompleteProfileDescription')}</p>}
      />
      <CompleteProfileForm
        disableBirthdayPicker={disableBirthdayPicker}
        onClickSkipButton={onSkip}
        onClickSaveButton={onSave}
        onClose={onClose}
      />
    </>
  );
};

CompleteUserProfile.displayName = 'CompleteUserProfile';

CompleteUserProfile.propTypes = {
  disableBirthdayPicker: PropTypes.bool,
  onSkip: PropTypes.func,
  onSave: PropTypes.func,
  onClose: PropTypes.func,
};

CompleteUserProfile.defaultProps = {
  disableBirthdayPicker: true,
  onSkip: () => {},
  onSave: () => {},
  onClose: () => {},
};

export default CompleteUserProfile;
