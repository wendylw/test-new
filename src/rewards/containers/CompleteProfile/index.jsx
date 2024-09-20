import React from 'react';
import { useTranslation } from 'react-i18next';
import CompleteProfileImage from '../../../images/complete-profile.svg';
import HeroSection from './components/HeroSection';
import styles from './CompleteProfile.module.scss';

const CompleteProfile = () => {
  const { t } = useTranslation();

  return (
    <HeroSection
      title={t('CompleteProfileTile')}
      image={CompleteProfileImage}
      description={<p className={styles.CompleteProfileDescription}>{t('CompleteProfileDescription')}</p>}
    />
  );
};

CompleteProfile.displayName = 'CompleteProfile';

export default CompleteProfile;
