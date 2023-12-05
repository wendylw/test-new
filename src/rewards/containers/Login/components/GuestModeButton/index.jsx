import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Button from '../../../../../common/components/Button';
import styles from './GuestModeButton.module.scss';

const GuestModeButton = ({ onContinueAsGuest }) => {
  const { t } = useTranslation();

  return (
    <section className={`${styles.GuestModeButtonContainer} page-login__login-as-guest-button`}>
      <Button type="text" data-test-id="ordering.login.guest-mode-button" onClick={onContinueAsGuest}>
        {t('ContinueAsGuest')}
      </Button>
    </section>
  );
};

GuestModeButton.displayName = 'GuestModeButton';

GuestModeButton.defaultProps = {
  onContinueAsGuest: () => {},
};

GuestModeButton.propTypes = {
  onContinueAsGuest: PropTypes.func,
};

export default GuestModeButton;
