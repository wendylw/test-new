import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import CompleteBirthdayImage from '../../../images/complete-birthday.svg';
import { DirectionArrow } from '../../../common/components/Icons';
import HeroSection from './components/HeroSection';
import CompleteBirthdayForm from './components/CompleteBirthdayForm';
import styles from './CompleteBirthday.module.scss';

const CompleteBirthday = ({ onSkip, onSave }) => {
  const { t } = useTranslation();

  return (
    <>
      <HeroSection
        title={t('CompleteBirthdayTitle')}
        image={CompleteBirthdayImage}
        description={
          <div className={styles.CompleteBirthdayDescriptionContainer}>
            <p className={styles.CompleteBirthdayDescription}>{t('CompleteBirthdayDescription')}</p>
            <DirectionArrow className={styles.CompleteBirthdayDirectionArrow} />
          </div>
        }
      />
      <CompleteBirthdayForm onClickSkipButton={onSkip} onClickSaveButton={onSave} />
    </>
  );
};

CompleteBirthday.displayName = 'CompleteBirthday';

CompleteBirthday.propTypes = {
  onSkip: PropTypes.func,
  onSave: PropTypes.func,
};

CompleteBirthday.defaultProps = {
  onSkip: () => {},
  onSave: () => {},
};

export default CompleteBirthday;
