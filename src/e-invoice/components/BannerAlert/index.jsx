import React from 'react';
import PropTypes from 'prop-types';
import { Info, WarningCircle } from 'phosphor-react';
import { getClassName } from '../../../common/utils/ui';
import styles from './BannerAlert.module.scss';

const BannerAlert = ({ type, title, description }) => {
  const icons = {
    info: <Info size={24} weight="fill" className={styles.BannerAlertInfoIcon} />,
    warning: <WarningCircle size={24} weight="fill" className={styles.BannerAlertWarningIcon} />,
  };

  return (
    <section className={getClassName([styles.BannerAlert, type])}>
      {icons[type]}
      <div>
        <h4 className={styles.BannerAlertTitle}>{title}</h4>
        {description ? <p className={styles.BannerAlertDescription}>{description}</p> : null}
      </div>
    </section>
  );
};

BannerAlert.displayName = 'BannerAlert';

BannerAlert.propTypes = {
  type: PropTypes.oneOf(['info', 'warning']),
  title: PropTypes.string,
  description: PropTypes.string,
};

BannerAlert.defaultProps = {
  type: 'info',
  title: '',
  description: null,
};

export default BannerAlert;
