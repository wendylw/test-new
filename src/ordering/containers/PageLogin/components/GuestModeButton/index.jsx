import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getIsQrOrderingShippingType } from '../../../../redux/modules/app';
import Button from '../../../../../common/components/Button';
import styles from './GuestModeButton.module.scss';

const GuestModeButton = ({ onContinueAsGuest }) => {
  const { t } = useTranslation();
  const isQrOrderingShippingType = useSelector(getIsQrOrderingShippingType);

  if (!isQrOrderingShippingType) {
    return null;
  }

  return (
    <section className={styles.GuestModeButtonContainer}>
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
