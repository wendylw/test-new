import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './RibbonBadge.module.scss';

const RibbonBadge = ({ title, color, className, isClosed }) => {
  const classNameList = [styles.RibbonBadgeContainer, 'text-size-reset'];

  if (className) {
    classNameList.push(className);
  }

  const backgroundStyles = useMemo(
    () => ({
      background: `linear-gradient(${color}, ${color})${
        isClosed ? `, linear-gradient(rgba(0,0,0, 0.4), rgba(0,0,0, 0.4))` : ''
      }`,
    }),
    [color, isClosed]
  );

  return (
    <div className={classNameList.join(' ')}>
      <div>
        <div className={styles.RibbonBadgeCornerContent} style={{ borderBottomColor: color }} />
        {isClosed && <div className={styles.RibbonBadgeCornerOverlay} />}
      </div>
      <span className={`${styles.RibbonBadgeTitle} ${isClosed ? 'tw-text-opacity-40' : ''}`} style={backgroundStyles}>
        {title}
      </span>
    </div>
  );
};

RibbonBadge.displayName = 'RibbonBadge';

RibbonBadge.propTypes = {
  title: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
  isClosed: PropTypes.bool,
};

RibbonBadge.defaultProps = {
  title: '',
  color: '',
  className: '',
  isClosed: false,
};

export default RibbonBadge;
